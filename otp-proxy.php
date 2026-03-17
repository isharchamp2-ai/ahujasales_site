<?php
/**
 * OTP Proxy — Ahuja Sales India
 * Upload this file to your web server (works on any PHP 7.4+ host).
 * Configure FAST2SMS_API_KEY below (or via environment variable).
 *
 * Endpoints:
 *   POST /otp-proxy.php?action=send   { mobile: "9XXXXXXXXX" }
 *   POST /otp-proxy.php?action=verify { mobile: "9XXXXXXXXX", otp: "123456" }
 */

// ─── CONFIG ──────────────────────────────────────────────────────────────────
define('FAST2SMS_API_KEY', getenv('FAST2SMS_API_KEY') ?: 'YOUR_API_KEY_HERE');
define('OTP_EXPIRY_SECS',  300);    // 5 minutes
define('MAX_SENDS',        3);
define('RATE_WINDOW_SECS', 600);    // 10 minutes
define('OTP_STORE_DIR',    sys_get_temp_dir() . '/ahuja_otp/');

// ─── CORS ─────────────────────────────────────────────────────────────────────
header('Content-Type: application/json');
$allowed = ['http://localhost', 'http://127.0.0.1', 'https://ahujasalesindia.com', 'https://www.ahujasalesindia.com'];
$origin  = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origin, $allowed) || preg_match('/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/', $origin)) {
    header("Access-Control-Allow-Origin: $origin");
}
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }

// ─── HELPERS ──────────────────────────────────────────────────────────────────
if (!is_dir(OTP_STORE_DIR)) mkdir(OTP_STORE_DIR, 0700, true);

function cleanMobile(string $raw): string {
    $m = preg_replace('/[\s\-]/', '', $raw);
    if (str_starts_with($m, '+91')) $m = substr($m, 3);
    if (str_starts_with($m, '91') && strlen($m) === 12) $m = substr($m, 2);
    return $m;
}

function isValidMobile(string $m): bool {
    return (bool) preg_match('/^[6-9]\d{9}$/', $m);
}

function otpFile(string $mobile): string {
    return OTP_STORE_DIR . md5($mobile) . '.json';
}

function readRecord(string $mobile): array {
    $f = otpFile($mobile);
    if (!file_exists($f)) return [];
    return json_decode(file_get_contents($f), true) ?? [];
}

function writeRecord(string $mobile, array $data): void {
    file_put_contents(otpFile($mobile), json_encode($data));
}

function deleteRecord(string $mobile): void {
    @unlink(otpFile($mobile));
}

function sendFast2SMS(string $mobile, string $otp): array {
    $msg = "Your OTP for Ahuja Sales India order verification is $otp. Valid for 5 minutes. Do not share.";
    $ch  = curl_init('https://www.fast2sms.com/dev/bulkV2');
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST           => true,
        CURLOPT_POSTFIELDS     => http_build_query([
            'authorization' => FAST2SMS_API_KEY,
            'route'         => 'q',
            'message'       => $msg,
            'language'      => 'english',
            'flash'         => '0',
            'numbers'       => $mobile,
        ]),
        CURLOPT_HTTPHEADER     => ['Content-Type: application/x-www-form-urlencoded'],
        CURLOPT_TIMEOUT        => 15,
        CURLOPT_SSL_VERIFYPEER => true,
    ]);
    $resp = curl_exec($ch);
    $err  = curl_error($ch);
    curl_close($ch);
    if ($err) throw new RuntimeException("cURL error: $err");
    $data = json_decode($resp, true);
    if (!($data['return'] ?? false)) {
        throw new RuntimeException($data['message'] ?? 'Fast2SMS rejected the request');
    }
    return $data;
}

// ─── ACTIONS ──────────────────────────────────────────────────────────────────
$action = $_GET['action'] ?? '';
$body   = json_decode(file_get_contents('php://input'), true) ?? [];

if ($action === 'send') {
    $raw    = trim((string)($body['mobile'] ?? ''));
    $mobile = cleanMobile($raw);

    if (!isValidMobile($mobile)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Invalid Indian mobile number.']);
        exit;
    }

    $now    = time();
    $record = readRecord($mobile);
    $sends  = $record['sends']  ?? [];
    $win    = $record['window'] ?? $now;

    // Clear old window
    if ($now - $win >= RATE_WINDOW_SECS) { $sends = []; $win = $now; }

    if (count($sends) >= MAX_SENDS) {
        $wait = ceil((RATE_WINDOW_SECS - ($now - $win)) / 60);
        http_response_code(429);
        echo json_encode(['success' => false, 'message' => "Too many OTP requests. Please wait $wait minute(s)."]);
        exit;
    }

    $otp = str_pad((string)random_int(100000, 999999), 6, '0', STR_PAD_LEFT);

    try {
        sendFast2SMS($mobile, $otp);
    } catch (Exception $e) {
        error_log('[OTP] Send failed: ' . $e->getMessage());
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Failed to send OTP. Please try again.']);
        exit;
    }

    $sends[] = $now;
    writeRecord($mobile, ['otp' => $otp, 'expiry' => $now + OTP_EXPIRY_SECS, 'sends' => $sends, 'window' => $win]);
    echo json_encode(['success' => true, 'message' => 'OTP sent successfully!']);

} elseif ($action === 'verify') {
    $raw    = trim((string)($body['mobile'] ?? ''));
    $mobile = cleanMobile($raw);
    $entered = trim((string)($body['otp'] ?? ''));

    if (!$mobile || !$entered) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Mobile and OTP are required.']);
        exit;
    }

    $record = readRecord($mobile);
    if (empty($record)) {
        echo json_encode(['success' => false, 'message' => 'No OTP found. Please request a new OTP.']);
        exit;
    }
    if (time() > ($record['expiry'] ?? 0)) {
        deleteRecord($mobile);
        echo json_encode(['success' => false, 'message' => 'OTP has expired. Please request a new one.']);
        exit;
    }
    if ($entered !== ($record['otp'] ?? '')) {
        echo json_encode(['success' => false, 'message' => 'Incorrect OTP. Please try again.']);
        exit;
    }

    deleteRecord($mobile);
    echo json_encode(['success' => true, 'message' => 'Mobile number verified!']);

} else {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Unknown action.']);
}
