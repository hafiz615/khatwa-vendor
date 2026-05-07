import { Calendar } from "lucide-react"

const isOverdue = (date) => new Date(date) < new Date()

function ProjectCardView({ projects, onProjectClick }) {
  if (projects?.length === 0)
    return (
      <div className="md:hidden text-center py-12 bg-white border border-slate-200 rounded-md">
        <p className="text-slate-500">No projects found</p>
      </div>
    )

  return (
    <div className="md:hidden grid grid-cols-1 gap-4">
      {projects && projects.map((p) => (
        <div
          key={p._id}
          onClick={() => onProjectClick(p._id)}
          className="bg-white border border-slate-200 p-4 rounded-md shadow hover:shadow-md cursor-pointer"
        >
          <h3 className="text-lg font-semibold">{p.projectName || "-"}</h3>
          <p className="text-xs text-slate-500 mb-2">
            Created {new Date(p.createdAt).toLocaleDateString()}
          </p>
          <p className="text-sm text-slate-600 mb-2">{p.description || "No description"}</p>
          <p className="text-sm text-slate-700">
            <b>Service:</b> {p.designService || "-"}
          </p>
          <p className="text-sm text-slate-700">
            <b>Budget:</b> {p.budget || "-"}
          </p>
          <div className="flex items-center gap-2 mt-2">
            <Calendar size={16} />
            <span className={isOverdue(p.deliveryTime) ? "text-red-600" : "text-slate-700"}>
              Delivery: {new Date(p.deliveryTime).toLocaleDateString()}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}

export default ProjectCardView;