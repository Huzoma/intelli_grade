"use client";

export function Table({ headers, children, isEmpty, emptyMessage = "No items found." }) {
  return (
    <div className="glass-panel rounded-2xl shadow-sm overflow-hidden border border-slate-200 dark:border-slate-800 transition-colors">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[600px]">
          <thead>
            <tr className="bg-slate-50/50 dark:bg-slate-900/40 border-b border-slate-200 dark:border-slate-800">
              {headers.map((h, i) => (
                <th 
                  key={i} 
                  className={`px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider ${
                    i === headers.length - 1 ? "text-right" : ""
                  }`}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {isEmpty ? (
              <tr>
                <td colSpan={headers.length} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400 text-sm">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              children
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function TableRow({ children, className = "" }) {
  return (
    <tr className={`hover:bg-slate-500/[0.02] dark:hover:bg-slate-800/20 transition-colors ${className}`}>
      {children}
    </tr>
  );
}

export function TableCell({ children, className = "", align = "left" }) {
  return (
    <td className={`px-6 py-4.5 text-sm ${align === "right" ? "text-right" : ""} ${className}`}>
      {children}
    </td>
  );
}
