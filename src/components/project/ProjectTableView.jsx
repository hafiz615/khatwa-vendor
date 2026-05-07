import { Calendar } from "lucide-react"

const isOverdue = (date) => new Date(date) < new Date()

function ProjectTableView({ projects, onProjectClick }) {
  if (projects?.length === 0)
    return (
      <div className="hidden md:block text-center py-12 bg-white border border-slate-200 rounded-md">
        <p className="text-slate-500">No projects found</p>
      </div>
    )

  return (
    <div className="hidden md:block bg-white rounded-md shadow border border-slate-200 overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="bg-slate-100 border-b border-slate-200">
            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-800">Project</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-800">Service</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-800">Budget</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-800">Delivery</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-800">Description</th>
          </tr>
        </thead>
        <tbody>
          {projects && projects.map((p) => (
            <tr
              key={p._id}
              onClick={() => onProjectClick(p._id)}
              className="border-b border-slate-200 hover:bg-slate-50 cursor-pointer"
            >
              <td className="px-6 py-4">
                <p className="font-medium">{p.projectName || "-"}</p>
                <p className="text-xs text-slate-500">{new Date(p.createdAt).toLocaleDateString()}</p>
              </td>
              <td className="px-6 py-4 text-sm text-slate-700">{p.designService || "-"}</td>
              <td className="px-6 py-4 text-sm text-slate-700">{p.budget || "-"}</td>
              <td className="px-6 py-4 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar
                    size={16}
                    className={isOverdue(p.deliveryTime) ? "text-red-500" : "text-slate-400"}
                  />
                  <span className={isOverdue(p.deliveryTime) ? "text-red-600" : "text-slate-700"}>
                    {new Date(p.deliveryTime).toLocaleDateString()}
                  </span>
                </div>
              </td>
              <td className="px-6 py-4 text-sm text-slate-600 truncate max-w-xs">{p.description || "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default ProjectTableView;