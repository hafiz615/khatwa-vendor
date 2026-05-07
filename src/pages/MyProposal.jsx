"use client";

import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  ClipboardList,
  FolderKanban,
} from "lucide-react";
import { fetchProposals } from "../services/project.service";
import ProposalCard from "../components/project/ProposalCard";

function MyProposals() {
  const token = useSelector((state) => state.auth.token);
  const [proposals, setProposals] = useState(null);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState({}); // Track which proposals are expanded

  useEffect(() => {
    async function getProposals() {
      try {
        setLoading(true);
        const res = await fetchProposals(token);
        if (res.success) setProposals(res.proposals || []);
        else console.error(res.message);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    getProposals();
  }, [token]);

  const toggleExpand = (id) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };
  console.log("Proposals:", proposals);
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
          <FolderKanban className="text-blue-600" size={22} />
          My Proposals
        </h1>

        <div className="grid gap-5">
          {loading ? (
            <div className="flex justify-center items-center min-h-[50vh]">
              <div className="loader" />
            </div>
          ) : proposals && !proposals.length ? (
            <div className="flex flex-col items-center justify-center h-80 text-gray-500">
              <ClipboardList size={40} className="mb-2 text-gray-400" />
              <p>No proposals submitted yet.</p>
            </div>
          ) : (
            proposals?.map((proposal) => (
              <ProposalCard
                key={proposal._id}
                proposal={proposal}
                expanded={expanded}
                onToggleExpand={() => toggleExpand(proposal._id)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default MyProposals;