import Navbar from "~/components/navbar";
import ResumeCard from "~/components/ResumeCard";
import { usePuterStore } from "~/lib/puter";
import { Link, useNavigate } from "react-router";
import { useEffect, useState } from "react";
import type { Route } from "./+types/home";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Resumind" },
    { name: "description", content: "Smart feedback for your dream job" },
  ];
}

export default function Home() {
  const { auth, kv, fs } = usePuterStore();
  const navigate = useNavigate();

  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loadingResume, setLoadingResume] = useState(false);

  useEffect(() => {
    if (!auth.isAuthenticated) navigate("/auth?next=/");
  }, [auth.isAuthenticated]);

  useEffect(() => {
    console.log("Use effect to load Previous Resumes Triggered");
    const loadResumes = async () => {
      setLoadingResume(true);
      const resumes = (await kv.list("resume:*", true)) as KVItem[];

      const parsedResumes = resumes?.map(
        (resume) => JSON.parse(resume.value) as Resume
      );

      console.log("parsedResumes", parsedResumes);
      setResumes(parsedResumes || []);
      setLoadingResume(false);
    };

    loadResumes();
  }, []);

  return (
    <main className="bg-[url('/images/bg-main.svg')] bg-cover">
      <Navbar />
      <section className="main-section">
        <div className="page-heading py-16">
          <h1>Track Your Applications & Resume Rating</h1>
          {!loadingResume && resumes?.length === 0 ? (
            <h2>
              No Resume Found in Storage. Upload your first Resume to get
              feedback.
            </h2>
          ) : (
            <h2>Review your submission and AI-powered feedback</h2>
          )}
        </div>

        {loadingResume && (
          <div className="flex flex-col items-center justify-center">
            <img src="/images/resume-scan-2.gif" className="w-[400px]" />
          </div>
        )}

        {!loadingResume && resumes.length > 0 && (
          <div className="flex flex-wrap justify-center resume-section">
            {resumes.map((resume) => (
              <ResumeCard key={resume.id} resume={resume} />
            ))}
          </div>
        )}
        {!loadingResume && resumes?.length === 0 && (
          <div className="flex flex-col items-center justify-center mt-10 gap-4">
            <Link
              to="/upload"
              className="primary-button w-fit text-xl font-semibold "
            >
              Upload Resume
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}
