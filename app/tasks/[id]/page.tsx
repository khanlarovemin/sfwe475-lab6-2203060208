export default async function TaskPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  console.log("id is a", typeof id, "and its value is", id);
  return <h2>Task {id}</h2>;
}
