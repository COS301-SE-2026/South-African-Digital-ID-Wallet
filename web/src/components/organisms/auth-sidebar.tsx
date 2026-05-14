import * as React from 'react'

export function AuthSidebar() {
  return (
    <div className="hidden lg:flex w-1/3 bg-gradient-to-b from-[#0E2B1D] to-[#18452E] text-white p-10 flex-col justify-between min-h-screen">
      <div>
        <div className="flex items-center gap-4 mb-8">
          <div className="bg-[#F4D35E] text-[#173F2A] font-bold rounded-2xl w-14 h-14 flex items-center justify-center text-2xl shadow-lg">
            FI
          </div>

          <div>
            <h1 className="text-4xl font-bold">Flash ID</h1>
            <p className="text-green-200 mt-1">
              Secure Digital Identity Platform
            </p>
          </div>
        </div>

        <h2 className="text-3xl font-bold leading-tight mb-4">
          Fast.
          <br />
          Secure.
          <br />
          Verified.
        </h2>

        <p className="text-base text-gray-300 leading-relaxed max-w-md">
          Access your secure digital identity, verify credentials instantly, and
          safely share personal information with trusted institutions.
        </p>
      </div>

      <div className="space-y-4">
        <div className="bg-white/10 backdrop-blur-md rounded-3xl p-4 border border-white/10">
          <h3 className="font-semibold text-lg mb-1">
            Biometric Authentication
          </h3>

          <p className="text-gray-300 text-sm leading-relaxed">
            Secure login using fingerprint and facial recognition technology.
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-3xl p-4 border border-white/10">
          <h3 className="font-semibold text-lg mb-1">Government Verified</h3>

          <p className="text-gray-300 text-sm leading-relaxed">
            Trusted identity verification backed by official institutions.
          </p>
        </div>

        <div className="bg-[#4C8B64] rounded-3xl p-4 flex items-center justify-between">
          <div>
            <p className="font-semibold text-base">Security Status</p>
            <p className="text-sm text-green-100">
              asdf;lkajsdf;kads;fkjas;dfkjasdf
            </p>
          </div>

          <div className="w-3 h-3 bg-green-300 rounded-full animate-pulse" />
        </div>
      </div>
    </div>
  )
}
