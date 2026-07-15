export default function Loading() {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="页面加载中">
      <div className="skeleton h-10 w-2/5" />
      <div className="skeleton h-28 w-full" />
      <div className="skeleton h-28 w-full" />
    </div>
  );
}
