import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';

export default function Login({ status, canResetPassword }: { status?: string, canResetPassword?: boolean }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const [showPassword, setShowPassword] = useState(false);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <div className="flex min-h-screen bg-white font-sans text-slate-800">
            <Head title="Log in" />

            {/* Left Panel */}
            <div 
                className="hidden md:flex md:w-1/2 relative bg-cover bg-center"
                style={{ backgroundColor: '#2d3748', backgroundImage: 'linear-gradient(135deg, #1f2937 0%, #374151 100%)' }}
            >
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
                
                {/* Content */}
                <div className="relative z-10 flex flex-col justify-end p-12 lg:p-16 h-full text-white w-full">
                    <h1 className="text-4xl lg:text-5xl font-bold leading-tight mb-4 tracking-tight">
                        Membangun<br/>Keharmonisan di<br/>Ujung Jari.
                    </h1>
                    <p className="text-lg text-white/90 mb-8 max-w-lg leading-relaxed">
                        Bergabunglah dengan ribuan tetangga yang telah menciptakan lingkungan yang lebih peduli, aman, dan terkoneksi.
                    </p>
                    
                    <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 self-start">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                        <span className="font-medium text-sm">12k+ Tetangga Aktif</span>
                    </div>
                </div>
            </div>

            {/* Right Panel */}
            <div className="w-full md:w-1/2 flex items-center justify-center p-6 relative bg-[#FAFAFA] overflow-hidden">
                {/* Watermark */}
                <div className="absolute -bottom-10 -right-10 text-gray-200/50 pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" width="240" height="240" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M7 14s-1 0-1-1 1-4 5-4 5 3 5 4-1 1-1 1H7Zm4-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm-5.784 6A2.238 2.238 0 0 1 5 13c0-1.355.68-2.75 1.936-3.72A6.325 6.325 0 0 0 5 9c-4 0-5 3-5 4s1 1 1 1h4.216ZM4.5 8a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z"/>
                    </svg>
                </div>

                <div className="w-full max-w-md relative z-10">
                    <div className="mb-10">
                        <div className="flex items-center gap-2 mb-8">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[#3B6B55]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span className="text-2xl font-bold text-[#3B6B55] tracking-tight">RumaKita</span>
                        </div>
                        <h2 className="text-3xl font-bold text-slate-900 mb-2">Selamat Datang Kembali di<br/>RumaKita</h2>
                        <p className="text-slate-500">Masuk untuk terhubung dengan tetangga Anda.</p>
                    </div>

                    {status && (
                        <div className="mb-4 text-sm font-medium text-green-600">
                            {status}
                        </div>
                    )}

                    <form onSubmit={submit} className="space-y-5">
                        <div>
                            <label htmlFor="email" className="block text-sm font-semibold text-slate-800 mb-1.5">
                                Email atau Nomor Telepon
                            </label>
                            <input
                                id="email"
                                type="text"
                                name="email"
                                value={data.email}
                                placeholder="nama@email.com"
                                className="mt-1 block w-full rounded-lg border-gray-200 bg-gray-50/50 px-4 py-3 text-sm focus:border-[#3B6B55] focus:ring-[#3B6B55]"
                                autoComplete="username"
                                onChange={(e) => setData('email', e.target.value)}
                            />
                            {errors.email && <p className="mt-2 text-sm text-red-600">{errors.email}</p>}
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-1.5">
                                <label htmlFor="password" className="block text-sm font-semibold text-slate-800">
                                    Kata Sandi
                                </label>
                                {canResetPassword && (
                                    <Link
                                        href={route('password.request')}
                                        className="text-sm font-medium text-[#3B6B55] hover:underline"
                                    >
                                        Lupa kata sandi?
                                    </Link>
                                )}
                            </div>
                            <div className="relative">
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    value={data.password}
                                    placeholder="••••••••"
                                    className="mt-1 block w-full rounded-lg border-gray-200 bg-gray-50/50 px-4 py-3 text-sm tracking-widest focus:border-[#3B6B55] focus:ring-[#3B6B55] pr-10"
                                    autoComplete="current-password"
                                    onChange={(e) => setData('password', e.target.value)}
                                />
                                <button 
                                    type="button" 
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                        </svg>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                            {errors.password && <p className="mt-2 text-sm text-red-600">{errors.password}</p>}
                        </div>

                        {/* Hidden remember me, but preserved in state */}
                        <div className="hidden">
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    name="remember"
                                    checked={data.remember}
                                    onChange={(e) => setData('remember', e.target.checked)}
                                    className="rounded border-gray-300 text-[#3B6B55] shadow-sm focus:ring-[#3B6B55]"
                                />
                                <span className="ms-2 text-sm text-gray-600">Remember me</span>
                            </label>
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full rounded-full bg-[#3B6B55] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#2F5644] focus:outline-none focus:ring-2 focus:ring-[#3B6B55] focus:ring-offset-2 disabled:opacity-50"
                            >
                                {processing ? 'Memproses...' : 'Masuk'}
                            </button>
                        </div>
                    </form>



                    <div className="mt-10 text-center text-sm text-slate-500">
                        Belum punya akun?{' '}
                        {/* We use route('register') if it exists, otherwise just '#' */}
                        <Link href={route('register')} className="font-semibold text-[#3B6B55] hover:underline">
                            Daftar Sekarang
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
