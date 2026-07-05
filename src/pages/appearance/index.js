import React from 'react';
import Head from 'next/head';
import Appearance from '@/components/appearance/Appearance';

export default function AppearancePage() {
  return (
    <>
      <Head>
        <title>Appearance | Glowison ERP</title>
      </Head>
      <div className="flex-1 h-[calc(100vh-64px)] overflow-hidden">
        <Appearance />
      </div>
    </>
  );
}
