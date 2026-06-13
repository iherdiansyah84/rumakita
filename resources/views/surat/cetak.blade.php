<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cetak Surat - {{ $surat->nomor_surat ?? 'Draft' }}</title>
    <style>
        body {
            font-family: 'Times New Roman', Times, serif;
            font-size: 12pt;
            line-height: 1.5;
            margin: 0;
            padding: 0;
        }
        .container {
            width: 21cm; /* A4 width */
            min-height: 29.7cm; /* A4 height */
            margin: 0 auto;
            padding: 2.5cm 2cm;
            box-sizing: border-box;
            background: white;
        }
        .header {
            text-align: center;
            border-bottom: 3px solid black;
            padding-bottom: 10px;
            margin-bottom: 20px;
        }
        .header h2, .header h3, .header p {
            margin: 0;
        }
        .header h2 {
            font-size: 16pt;
            text-transform: uppercase;
        }
        .header h3 {
            font-size: 14pt;
        }
        .header p {
            font-size: 10pt;
        }
        .title {
            text-align: center;
            margin-bottom: 30px;
        }
        .title h4 {
            margin: 0;
            font-size: 14pt;
            text-decoration: underline;
            text-transform: uppercase;
        }
        .title p {
            margin: 0;
        }
        .content {
            text-align: justify;
        }
        .data-table {
            margin: 15px 0 15px 30px;
        }
        .data-table td {
            padding: 2px 10px 2px 0;
            vertical-align: top;
        }
        .data-table td:first-child {
            width: 150px;
        }
        .signature {
            margin-top: 50px;
            float: right;
            text-align: center;
            width: 250px;
        }
        .signature-space {
            height: 100px;
        }
        @media print {
            body {
                background: none;
            }
            .container {
                padding: 0;
                margin: 0;
                box-shadow: none;
            }
        }
    </style>
</head>
<body onload="window.print()">
    <div class="container">
        <!-- KOP SURAT -->
        <div class="header">
            <h2>
                RUKUN TETANGGA (RT) {{ auth()->user()->perumahan->rt ?? '......' }} / 
                RUKUN WARGA (RW) {{ auth()->user()->perumahan->rw ?? '......' }}
            </h2>
            <h3>PERUMAHAN {{ strtoupper(auth()->user()->perumahan->nama ?? 'WARGA') }}</h3>
            <p>
                Kelurahan {{ auth()->user()->perumahan->kelurahan ?? '......................' }}, 
                Kecamatan {{ auth()->user()->perumahan->kecamatan ?? '......................' }}, 
                {{ auth()->user()->perumahan->kota ?? '......................' }}, 
                {{ auth()->user()->perumahan->provinsi ?? '' }} 
                {{ auth()->user()->perumahan->kode_pos ?? '' }}
            </p>
        </div>

        <!-- JUDUL SURAT -->
        <div class="title">
            <h4>{{ $surat->jenis_surat }}</h4>
            <p>Nomor: {{ $surat->nomor_surat ?? '....................................' }}</p>
        </div>

        <!-- ISI SURAT -->
        <div class="content">
            <p>Yang bertanda tangan di bawah ini, Ketua RT Perumahan {{ auth()->user()->perumahan->nama ?? '' }}, menerangkan bahwa:</p>

            <table class="data-table">
                <tr>
                    <td>Nama Lengkap</td>
                    <td>: <strong>{{ strtoupper($pemohon->nama ?? $surat->user->name) }}</strong></td>
                </tr>
                <tr>
                    <td>No. KTP / NIK</td>
                    <td>: {{ $pemohon->nik ?? '-' }}</td>
                </tr>
                <tr>
                    <td>Tempat, Tgl. Lahir</td>
                    <td>: {{ $pemohon->tempat_lahir ?? '-' }}, {{ $pemohon->tanggal_lahir ? \Carbon\Carbon::parse($pemohon->tanggal_lahir)->translatedFormat('d F Y') : '-' }}</td>
                </tr>
                <tr>
                    <td>Jenis Kelamin</td>
                    <td>: {{ $pemohon->jenis_kelamin ?? '-' }}</td>
                </tr>
                <tr>
                    <td>Agama</td>
                    <td>: {{ $pemohon->agama ?? $warga->agama ?? '-' }}</td>
                </tr>
                <tr>
                    <td>Pekerjaan</td>
                    <td>: {{ $pemohon->pekerjaan ?? '-' }}</td>
                </tr>
                <tr>
                    <td>Alamat</td>
                    <td>: Blok {{ $warga->blok ?? '-' }} / Perumahan {{ $warga->perumahan->nama ?? 'Rumakita' }}</td>
                </tr>
                <tr>
                    <td>Keperluan</td>
                    <td>: {{ $surat->keperluan }}</td>
                </tr>
                @if($surat->keterangan_tambahan)
                <tr>
                    <td>Keterangan</td>
                    <td>: {{ $surat->keterangan_tambahan }}</td>
                </tr>
                @endif
            </table>

            <p>Adalah benar warga yang berdomisili di lingkungan kami dan surat keterangan ini dibuat untuk keperluan sebagaimana disebutkan di atas.</p>
            <p>Demikian surat keterangan ini dibuat dengan sebenarnya agar dapat dipergunakan sebagaimana mestinya.</p>
        </div>

        <!-- TANDA TANGAN -->
        <div class="signature">
            <p>Dikeluarkan di: {{ auth()->user()->perumahan->kota ?? '............................' }}</p>
            <p>Pada Tanggal: {{ \Carbon\Carbon::parse($surat->updated_at)->translatedFormat('d F Y') }}</p>
            <br>
            <p><strong>Ketua RT</strong></p>
            <div class="signature-space"></div>
            <p>( <span style="text-decoration: underline; font-weight: bold;">{{ auth()->user()->perumahan->nama_ketua_rt ?? '_______________________' }}</span> )</p>
        </div>
    </div>
</body>
</html>
