import { useEffect, useState, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { useSelector, useDispatch } from "react-redux"
import { Loader2 } from "lucide-react"
import { setProjects } from "../slices/project"
import ProjectsHeader from "../components/project/ProjectHeader"
import ProjectsTableView from "../components/project/ProjectTableView"
import ProjectsCardView from "../components/project/ProjectCartView"
import PaginationControls from "../components/project/PaginationControls"
import { fetchProjects } from "../services/project.service"

function Projects() {
  const dispatch = useDispatch();
  const token = useSelector((state) => state.auth.token);
  const projects = useSelector((state) => state.project.projects);
  // const [projects, setProjects] = useState([ { _id: "6901e7be846bb3f3e63b4546", projectName: "khushi", designService: "Landscape Design", budget: "20K - 30K", deliveryTime: "2025-10-30T00:00:00.000Z", description: "ju6", createdAt: "2025-10-29T10:09:02.389Z", }, { _id: "6901e6a9846bb3f3e63b4511", projectName: "f", designService: "House / Chalet", budget: "30K - 50K", deliveryTime: "2025-10-29T00:00:00.000Z", description: "ui", createdAt: "2025-10-29T10:04:25.586Z", }, { _id: "6901e5cc846bb3f3e63b4497", projectName: "b", designService: "House / Chalet", budget: "20K - 30K", deliveryTime: "2025-10-30T00:00:00.000Z", description: "v9", createdAt: "2025-10-29T10:00:44.151Z", }, { _id: "6901e482846bb3f3e63b443d", projectName: "Abc", designService: "Landscape Design", budget: "20K - 30K", deliveryTime: "2025-10-30T00:00:00.000Z", description: "tyyy", createdAt: "2025-10-29T09:55:14.739Z", }, { _id: "6900d215f1d141fde3236f99", projectName: "khfghjfj", designService: "Interior Design", budget: "20K - 30K", deliveryTime: "2025-10-30T00:00:00.000Z", description: "ggvjkuyfiuiyfgtifu", createdAt: "2025-10-28T14:24:21.473Z", }, { _id: "6900976d0ed4a527a638eb1c", projectName: "Kuch", designService: "House / Chalet", budget: "20K - 30K", deliveryTime: "2025-10-29T00:00:00.000Z", description: "Balay", createdAt: "2025-10-28T10:14:05.984Z", }, ])
  const [activeFilter, setActiveFilter] = useState("all")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [page, setPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState("")
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 })
  const navigate = useNavigate()

  const getProjects = async() => {
    setLoading(true)
    setError("")
    try {
      const res = await fetchProjects(token, activeFilter, page, 10)
      console.log("Fetched Projects:", res);
      if (res.data.success) {
        dispatch(setProjects(res.data.projects))
        setPagination(res.data.pagination)
      }
    } catch (err) {
      setError("Failed to load projects. Please try again later.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    getProjects()
  }, [activeFilter, page])

  const filteredProjects = useMemo(() => {
    return projects?.filter(
      (p) =>
        p.projectName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.designService?.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [projects, searchQuery])

  const handleProjectClick = (id) => navigate(`/dashboard/projects/${id}`)

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto">
        <ProjectsHeader
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        {loading && (
          <div className="flex justify-center items-center py-16">
            <Loader2 className="animate-spin text-blue-600" size={32} />
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 p-4 rounded-md text-red-700">{error}</div>
        )}

        {!loading && !error && (
          <>
            <ProjectsTableView projects={filteredProjects} onProjectClick={handleProjectClick} />
            <ProjectsCardView projects={filteredProjects} onProjectClick={handleProjectClick} />

            <PaginationControls
              page={page}
              totalPages={pagination.totalPages}
              total={pagination.total}
              currentCount={filteredProjects?.length}
              onPageChange={setPage}
            />
          </>
        )}
      </div>
    </div>
  )
}

export default Projects;