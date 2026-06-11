<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AnggotaKeluarga;
use App\Models\Warga;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class WargaController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Warga::with('perumahan')->withCount('anggotaKeluarga');
        $user = auth()->user();

        if ($user && $user->isWarga()) {
            $query->where('email', $user->email);
        }

        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('nama', 'like', '%' . $request->search . '%')
                  ->orWhere('nik', 'like', '%' . $request->search . '%')
                  ->orWhere('blok', 'like', '%' . $request->search . '%');
            });
        }

        if ($request->filled('perumahan_id')) {
            $query->where('perumahan_id', $request->perumahan_id);
        }

        if ($request->filled('status_iuran')) {
            $query->where('status_iuran', $request->status_iuran);
        }

        $warga = $query->latest()->paginate($request->get('per_page', 15));

        return response()->json($warga);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'perumahan_id'      => 'required|exists:perumahan,id',
            'nama'              => 'required|string|max:255',
            'nik'               => 'required|string|max:16|unique:warga,nik',
            'blok'              => 'required|string|max:20',
            'no_hp'             => 'nullable|string|max:20',
            'email'             => 'nullable|email|max:255',
            'status_iuran'      => 'nullable|in:lunas,belum_lunas,tunggakan',
            'status_tinggal'    => 'nullable|in:Tetap,Kontrak,Pindah',
            'alamat_pindah'     => 'nullable|string',
            'tempat_lahir'      => 'nullable|string|max:100',
            'tanggal_lahir'     => 'nullable|date',
            'jenis_kelamin'     => 'nullable|in:laki-laki,perempuan',
            'agama'             => 'nullable|string|max:50',
            'pekerjaan'         => 'nullable|string|max:100',
            'status_perkawinan' => 'nullable|in:belum_kawin,kawin,cerai_hidup,cerai_mati',
            'alamat_asal'       => 'nullable|string',
            'tipe_dokumen'      => 'nullable|in:ktp,paspor,sim',
            'no_dokumen'        => 'nullable|string|max:50',
        ]);

        $warga = Warga::create($validated);
        $warga->load('perumahan');

        $passwordMsg = '';
        $generatedPassword = null;
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
                    $passwordMsg = ' Akun login warga telah dibuat.';
                    $generatedPassword = $password;
                }
            }
        }

        return response()->json([
            'message' => 'Warga berhasil ditambahkan.' . $passwordMsg,
            'password' => $generatedPassword,
            'warga'   => $warga,
        ], 201);
    }

    public function show(Warga $warga): JsonResponse
    {
        $warga->load(['perumahan', 'anggotaKeluarga']);

        return response()->json(['warga' => $warga]);
    }

    public function update(Request $request, Warga $warga): JsonResponse
    {
        $user = auth()->user();
        if ($user && $user->isWarga() && $warga->email !== $user->email) {
            abort(403, 'Anda hanya dapat mengubah data Anda sendiri.');
        }

        $validated = $request->validate([
            'perumahan_id'      => 'sometimes|required|exists:perumahan,id',
            'nama'              => 'sometimes|required|string|max:255',
            'nik'               => 'sometimes|required|string|max:16|unique:warga,nik,' . $warga->id,
            'blok'              => 'sometimes|required|string|max:20',
            'no_hp'             => 'nullable|string|max:20',
            'email'             => 'nullable|email|max:255',
            'status_iuran'      => 'nullable|in:lunas,belum_lunas,tunggakan',
            'status_tinggal'    => 'nullable|in:Tetap,Kontrak,Pindah',
            'alamat_pindah'     => 'nullable|string',
            'tempat_lahir'      => 'nullable|string|max:100',
            'tanggal_lahir'     => 'nullable|date',
            'jenis_kelamin'     => 'nullable|in:laki-laki,perempuan',
            'agama'             => 'nullable|string|max:50',
            'pekerjaan'         => 'nullable|string|max:100',
            'status_perkawinan' => 'nullable|in:belum_kawin,kawin,cerai_hidup,cerai_mati',
            'alamat_asal'       => 'nullable|string',
            'tipe_dokumen'      => 'nullable|in:ktp,paspor,sim',
            'no_dokumen'        => 'nullable|string|max:50',
        ]);

        $warga->update($validated);

        return response()->json([
            'message' => 'Warga berhasil diperbarui.',
            'warga'   => $warga->load('perumahan'),
        ]);
    }

    public function destroy(Warga $warga): JsonResponse
    {
        $warga->delete();

        return response()->json(['message' => 'Warga berhasil dihapus.']);
    }

    public function generateUser(Warga $warga): JsonResponse
    {
        if (empty($warga->email)) {
            return response()->json(['message' => 'Gagal membuat akun login. Data warga tidak memiliki email.'], 400);
        }

        $existingUser = \App\Models\User::where('email', $warga->email)->first();
        if ($existingUser) {
            return response()->json(['message' => 'Gagal membuat akun login. Email ini sudah terdaftar sebagai akun user.'], 400);
        }

        $wargaRole = \App\Models\Role::where('name', 'warga')->first();
        if (!$wargaRole) {
            return response()->json(['message' => 'Role Warga tidak ditemukan di sistem.'], 500);
        }

        $password = \Illuminate\Support\Str::random(8);
        \App\Models\User::create([
            'email' => $warga->email,
            'name' => $warga->nama,
            'password' => bcrypt($password),
            'role_id' => $wargaRole->id,
            'perumahan_id' => $warga->perumahan_id,
        ]);

        return response()->json([
            'message' => 'Akun login warga berhasil dibuat.',
            'password' => $password
        ]);
    }

    // ── Anggota Keluarga ────────────────────────────────────────────────

    public function indexAnggota(Warga $warga): JsonResponse
    {
        return response()->json([
            'anggota_keluarga' => $warga->anggotaKeluarga,
        ]);
    }

    public function storeAnggota(Request $request, Warga $warga): JsonResponse
    {
        $validated = $request->validate([
            'nama'             => 'required|string|max:255',
            'status_hubungan'  => 'required|string|max:50',
            'nik'              => 'nullable|string|max:16',
            'tanggal_lahir'    => 'nullable|date',
            'jenis_kelamin'    => 'nullable|in:laki-laki,perempuan',
            'pekerjaan'        => 'nullable|string|max:100',
        ]);

        $anggota = $warga->anggotaKeluarga()->create($validated);

        return response()->json([
            'message' => 'Anggota keluarga berhasil ditambahkan.',
            'anggota' => $anggota,
        ], 201);
    }

    public function updateAnggota(Request $request, Warga $warga, AnggotaKeluarga $anggota): JsonResponse
    {
        abort_if($anggota->warga_id !== $warga->id, 404);

        $validated = $request->validate([
            'nama'             => 'sometimes|required|string|max:255',
            'status_hubungan'  => 'sometimes|required|string|max:50',
            'nik'              => 'nullable|string|max:16',
            'tanggal_lahir'    => 'nullable|date',
            'jenis_kelamin'    => 'nullable|in:laki-laki,perempuan',
            'pekerjaan'        => 'nullable|string|max:100',
        ]);

        $anggota->update($validated);

        return response()->json([
            'message' => 'Anggota keluarga berhasil diperbarui.',
            'anggota' => $anggota,
        ]);
    }

    public function destroyAnggota(Warga $warga, AnggotaKeluarga $anggota): JsonResponse
    {
        abort_if($anggota->warga_id !== $warga->id, 404);

        $anggota->delete();

        return response()->json(['message' => 'Anggota keluarga berhasil dihapus.']);
    }
}
