import {
  CalendarDays,
  FileText,
  User2,
} from "lucide-react";

function ProposalCard({ proposal, expanded, onToggleExpand }) {

    const project = proposal.projectId;
    const client = project?.userId;        
    const isExpanded = expanded[proposal._id];
  return (
              <div
                // key={key}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition"
              >
                {/* Project Info */}
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start border-b border-gray-100 pb-4 mb-4">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-800">
                      {project.projectName}
                    </h2>
                    <p className="text-sm text-gray-500">
                      {project.designService} • Budget: {project.budget}
                    </p>
                  </div>

                  {/* Client Info */}
                  {client && (
                    <div className="flex items-center gap-3 mt-3 sm:mt-0 bg-gray-50 px-3 py-2 rounded-xl border border-gray-100">
                      <img
                        src={client.profile}
                        alt={client.name}
                        className="w-8 h-8 rounded-full object-cover border border-gray-200"
                      />
                      <span className="text-sm font-medium text-gray-700 flex items-center gap-1">
                        <User2 className="w-4 h-4 text-blue-500" />
                        {client.name}
                      </span>
                    </div>
                  )}
                </div>

                {/* Proposal Details */}
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2 text-gray-700">
                    <span className="text-blue-500">KWD</span>
                    <span>
                      <strong>Proposed Budget:</strong>{" "}
                      {proposal.proposedBudget}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-gray-700">
                    <CalendarDays className="w-4 h-4 text-green-500" />
                    <span>
                      <strong>Delivery Date:</strong>{" "}
                      {new Date(
                        proposal.proposedDeliveryTime
                      ).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex flex-col text-gray-700">
                    <div className="flex items-start gap-2">
                      <FileText className="w-4 h-4 text-purple-500 mt-0.5" />
                      <span
                        className={`${
                          !isExpanded ? "line-clamp-3" : ""
                        } transition-all duration-200`}
                      >
                        <strong>Details:</strong> {proposal.details}
                      </span>
                    </div>

                    {/* Show More / Less */}
                    {proposal.details.length > 120 && (
                      <button
                        onClick={() => onToggleExpand(proposal._id)}
                        className="text-blue-600 text-xs font-medium mt-1 hover:underline self-start"
                      >
                        {isExpanded ? "Show Less" : "Show More"}
                      </button>
                    )}
                  </div>

                  {/* Footer Row */}
                  <div className="flex items-center gap-2 mt-2">
                    <span
                      className={`px-3 py-1 text-xs font-medium rounded-full ${
                        proposal.status === "submitted"
                          ? "bg-blue-100 text-blue-600"
                          : proposal.status === "accepted"
                          ? "bg-green-100 text-green-600"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {proposal.status.toUpperCase()}
                    </span>
                    <span className="text-xs text-gray-400">
                      Sent on{" "}
                      {new Date(proposal.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            );
}

export default ProposalCard;
