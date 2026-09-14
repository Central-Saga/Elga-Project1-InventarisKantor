import { notFound, redirect } from 'next/navigation';

export default async function AdminRouteFallback({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = await params;

  if (slug.length === 1 && slug[0] === 'Users') {
    redirect('/admin/users');
  }

  notFound();
}