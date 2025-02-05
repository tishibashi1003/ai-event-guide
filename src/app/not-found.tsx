import Link from 'next/link';

export default function NotFound() {
  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-100'>
      <div className='text-center p-8 bg-white rounded-lg shadow-md'>
        <h1 className='text-6xl font-bold text-gray-800 mb-4'>404</h1>
        <h2 className='text-2xl font-semibold text-gray-600 mb-4'>
          ページが見つかりません
        </h2>
        <p className='text-gray-500 mb-8'>
          お探しのページは存在しないか、移動した可能性があります。
        </p>
        <Link
          href='/'
          className='inline-block bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors'
        >
          トップページへ戻る
        </Link>
      </div>
    </div>
  );
}
