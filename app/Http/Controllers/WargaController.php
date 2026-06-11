<?php

namespace App\Http\Controllers;

use App\Models\AnggotaKeluarga;
use App\Models\Perumahan;
use App\Models\Warga;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class WargaController extends Controller
{
    public function index(): Response
    {
        $query = Warga::with(['perumahan', 'anggotaKeluarga'])->latest();
        $user = auth()->user();

        if ($user && $user->isWarga()) {
            $query->where('email', $user->email);
        }

        $wargaRecords = $query->get();

        return Inertia::render('Warga/Index', [
            'warga' => $wargaRecords->map(fn(Warga $w) => [
                'id'                => $w->id,
                'perumahan_id'      => $w->perumahan_id,
                'perumahan'         => $w->perumahan ? ['id' => $w->perumahan->id, 'nama' => $w->perumahan->nama] : null,
                'nama'              => $w->nama,
                'nik'               => $w->nik,
                'blok'              => $w->blok,
                'no_hp'             => $w->no_hp,
                'email'             => $w->email,
                'status_iuran'      => $w->status_iuran,
                'status_tinggal'    => $w->status_tinggal,
                'alamat_pindah'     => $w->alamat_pindah,
                'tempat_lahir'      => $w->tempat_lahir,
                'tanggal_lahir'     => $w->tanggal_lahir?->format('Y-m-d'),
                'jenis_kelamin'     => $w->jenis_kelamin,
                'agama'             => $w->agama,
                'pekerjaan'         => $w->pekerjaan,
                'status_perkawinan' => $w->status_perkawinan,
                'alamat_asal'       => $w->alamat_asal,
                'tipe_dokumen'      => $w->tipe_dokumen,
                'no_dokumen'        => $w->no_dokumen,
                'foto_ktp_url'      => $w->foto_ktp ? Storage::url($w->foto_ktp) : null,
                'foto_kk_url'       => $w->foto_kk ? Storage::url($w->foto_kk) : null,
                'anggota_keluarga'  => $w->anggotaKeluarga->map(fn(AnggotaKeluarga $a) => [
                    'id'              => $a->id,
                    'nama'            => $a->nama,
                    'status_hubungan' => $a->status_hubungan,
                    'nik'             => $a->nik,
                    'tanggal_lahir'   => $a->tanggal_lahir?->format('Y-m-d'),
                    'jenis_kelamin'   => $a->jenis_kelamin,
                    'pekerjaan'       => $a->pekerjaan,
                ])->values(),
            ]),
            'perumahan' => Perumahan::select('id', 'nama')->where('status', 'active')->get(),
            'stats' => [
                'total_kk' => $wargaRecords->count(),
                'lunas'    => $wargaRecords->where('status_iuran', 'lunas')->count(),
                'pending'  => $wargaRecords->where('status_iuran', 'pending')->count(),
                'tunggak'  => $wargaRecords->where('status_iuran', 'tunggak')->count(),
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate($this->rules());

        $data = collect($validated)->except(['foto_ktp', 'foto_kk', 'anggota_keluarga'])->toArray();

        if ($request->hasFile('foto_ktp')) {
            $data['foto_ktp'] = $request->file('foto_ktp')->store('dokumen/ktp', 'public');
        }
        if ($request->hasFile('foto_kk')) {
            $data['foto_kk'] = $request->file('foto_kk')->store('dokumen/kk', 'public');
        }

        $warga = Warga::create($data);
        $this->syncAnggotaKeluarga($warga, $validated['anggota_keluarga'] ?? null);

        $passwordMsg = '';
        if (!empty($warga->email)) {
            $wargaRole = \App\Models\Role::where('name', 'warga')->first();
            if ($wargaRole) {
                $password = \Illuminate\Support\Str::random(8);
                $user = \App\Models\User::firstOrCreate(
                    ['email' => $warga->email],
                    [
                        'name' => $warga->nama,
                        'password' => bcrypt($password),
                        'role_id' => $wargaRole->id,
                        'perumahan_id' => $warga->perumahan_id,
                    ]
                );
                
                if ($user->wasRecentlyCreated) {
                    $passwordMsg = ' Akun login warga telah dibuat dengan password: ' . $password;
                }
            }
        }

        return back()->with('success', 'Warga berhasil ditambahkan.' . $passwordMsg);
    }

    public function update(Request $request, Warga $warga): RedirectResponse
    {
        $user = auth()->user();
        if ($user && $user->isWarga() && $warga->email !== $user->email) {
            abort(403, 'Anda hanya dapat mengubah data Anda sendiri.');
        }

        $validated = $request->validate($this->rules());

        $data = collect($validated)->except(['foto_ktp', 'foto_kk', 'anggota_keluarga'])->toArray();

        if ($request->hasFile('foto_ktp')) {
            if ($warga->foto_ktp) Storage::disk('public')->delete($warga->foto_ktp);
            $data['foto_ktp'] = $request->file('foto_ktp')->store('dokumen/ktp', 'public');
        }
        if ($request->hasFile('foto_kk')) {
            if ($warga->foto_kk) Storage::disk('public')->delete($warga->foto_kk);
            $data['foto_kk'] = $request->file('foto_kk')->store('dokumen/kk', 'public');
        }

        $warga->update($data);
        $this->syncAnggotaKeluarga($warga, $validated['anggota_keluarga'] ?? null);

        return back()->with('success', 'Data warga berhasil diperbarui.');
    }

    public function destroy(Warga $warga): RedirectResponse
    {
        if ($warga->foto_ktp) Storage::disk('public')->delete($warga->foto_ktp);
        if ($warga->foto_kk)  Storage::disk('public')->delete($warga->foto_kk);

        $warga->delete();

        return back()->with('success', 'Warga berhasil dihapus.');
    }

    public function generateUser(Warga $warga): RedirectResponse
    {
        if (empty($warga->email)) {
            return back()->withErrors(['email' => 'Gagal membuat akun login. Data warga tidak memiliki email.']);
        }

        $existingUser = \App\Models\User::where('email', $warga->email)->first();
        if ($existingUser) {
            return back()->withErrors(['email' => 'Gagal membuat akun login. Email ini sudah terdaftar sebagai akun user.']);
        }

        $wargaRole = \App\Models\Role::where('name', 'warga')->first();
        if (!$wargaRole) {
            return back()->withErrors(['role' => 'Role Warga tidak ditemukan di sistem.']);
        }

        $password = \Illuminate\Support\Str::random(8);
        \App\Models\User::create([
            'email' => $warga->email,
            'name' => $warga->nama,
            'password' => bcrypt($password),
            'role_id' => $wargaRole->id,
            'perumahan_id' => $warga->perumahan_id,
        ]);

        return back()->with('success', "Akun login warga berhasil dibuat. Password untuk login: {$password}");
    }

    private function rules(): array
    {
        return [
            'perumahan_id'      => 'nullable|exists:perumahan,id',
            'nama'              => 'required|string|max:255',
            'nik'               => 'nullable|string|max:20',
            'blok'              => 'required|string|max:50',
            'no_hp'             => 'nullable|string|max:30',
            'email'             => 'nullable|email|max:255',
            'status_iuran'      => 'required|in:lunas,pending,tunggak',
            'status_tinggal'    => 'nullable|in:Tetap,Kontrak,Pindah',
            'alamat_pindah'     => 'nullable|string',
            'tempat_lahir'      => 'nullable|string|max:100',
            'tanggal_lahir'     => 'nullable|date',
            'jenis_kelamin'     => 'nullable|in:L,P',
            'agama'             => 'nullable|string|max:50',
            'pekerjaan'         => 'nullable|string|max:100',
            'status_perkawinan' => 'nullable|string|max:50',
            'alamat_asal'       => 'nullable|string',
            'tipe_dokumen'      => 'nullable|in:KTP,Passport',
            'no_dokumen'        => 'nullable|string|max:30',
            'foto_ktp'          => 'nullable|file|mimes:jpg,jpeg,png,pdf|max:5120',
            'foto_kk'           => 'nullable|file|mimes:jpg,jpeg,png,pdf|max:5120',
            'anggota_keluarga'  => 'nullable|string',
        ];
    }

    private function syncAnggotaKeluarga(Warga $warga, ?string $json): void
    {
        $warga->anggotaKeluarga()->delete();

        if (!$json) return;

        $members = json_decode($json, true);
        if (!is_array($members)) return;

        foreach ($members as $m) {
            if (empty(trim($m['nama'] ?? ''))) continue;
            $warga->anggotaKeluarga()->create([
                'nama'            => $m['nama'],
                'status_hubungan' => $m['status_hubungan'] ?? 'Single',
                'nik'             => $m['nik'] ?: null,
                'tanggal_lahir'   => ($m['tanggal_lahir'] ?? '') ?: null,
                'jenis_kelamin'   => $m['jenis_kelamin'] ?: null,
                'pekerjaan'       => $m['pekerjaan'] ?: null,
            ]);
        }
    }
}
