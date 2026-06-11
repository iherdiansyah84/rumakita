<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Akses Ditolak - RumaKita</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background: #f8fafc;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            color: #1e293b;
        }
        .container {
            text-align: center;
            padding: 2rem;
            max-width: 480px;
        }
        .icon {
            width: 80px;
            height: 80px;
            background: #fef2f2;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 1.5rem;
            font-size: 2rem;
        }
        .code {
            font-size: 5rem;
            font-weight: 800;
            color: #e2e8f0;
            line-height: 1;
            margin-bottom: 0.5rem;
        }
        h1 { font-size: 1.5rem; font-weight: 700; margin-bottom: 0.75rem; }
        p { color: #64748b; margin-bottom: 2rem; line-height: 1.6; }
        a {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.75rem 1.5rem;
            background: #0d9488;
            color: white;
            border-radius: 0.5rem;
            text-decoration: none;
            font-weight: 600;
            transition: background 0.2s;
        }
        a:hover { background: #0f766e; }
    </style>
</head>
<body>
    <div class="container">
        <div class="icon">🔒</div>
        <div class="code">403</div>
        <h1>Akses Ditolak</h1>
        <p>
            Anda tidak memiliki izin untuk mengakses halaman ini.<br>
            Fitur ini hanya tersedia untuk <strong>Pengurus</strong>.
        </p>
        <a href="/dashboard">← Kembali ke Dashboard</a>
    </div>
</body>
</html>
