import { Search, ChevronDown } from "lucide-react";

function ProjectHeader({
  activeFilter,
  onFilterChange,
  searchQuery,
  onSearchChange,
}) {
  return (
    <div className="mb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
        {/* Left: Dropdown + Title */}
        <div className="flex flex-col justify-center gap-3">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Projects
          </h1>
          <p className="text-slate-600 hidden sm:block">
            Manage and track all your design projects
          </p>
        </div>
        {/* Dropdown Filter */}

        <div className="relative">
          <select
            value={activeFilter}
            onChange={(e) => onFilterChange(e.target.value)}
            className="appearance-none pl-3 pr-8 py-2 border border-slate-300 rounded-md bg-white text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            <option value="all">All Projects</option>
            <option value="my">My Projects</option>
            {/* <option value="invited">Invited Projects</option> */}
          </select>
          <ChevronDown
            size={16}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
          />
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative mt-2">
        <Search className="absolute left-3 top-3 text-slate-400" size={20} />
        <input
          type="text"
          placeholder="Search projects..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>
  );
}

export default ProjectHeader;