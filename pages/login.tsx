'use client';

import Image from 'next/image';
import React from 'react';
import orangeStarIcon from "../assets/Icon.png"
import { signIn ,useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';

const AFTER_LOGIN_URL = process.env.NEXT_PUBLIC_ZITADEL_AFTER_LOGIN_URL;

export default function Login() {
  const { status } = useSession();

  if(status === 'authenticated'){
    redirect(AFTER_LOGIN_URL as string);
  }
  
  return (
    <div className="flex h-screen">
     
      <div className="w-1/2 flex flex-col justify-center items-center bg-gray-50">
        {/* Logo */}
        <div className="mb-12 flex items-center gap-2">
          <h2 className='text-[#6B7B83] text-2xl'>MM</h2>
          <Image
            src={orangeStarIcon}
            alt="Logo"
            width={28}
            height={28}
          />
          <div className='w-[29px] h-[0px] rotate-90 border-[#7C7C7C]  border-[0.5px]'></div>
          <h2 className="text-[#6B7B83] text-base font-normal leading-6">Mohammed</h2>
        </div>
        <button
          onClick={() => signIn('zitadel',{callbackUrl: AFTER_LOGIN_URL})} // assuming you’re using next-auth
          className="w-85.5 h-10 bg-black text-white rounded-[120px] shadow hover:bg-[#222] cursor-pointer transition"
        >
          Sign in
        </button>
      </div>
    </div>
  );
}