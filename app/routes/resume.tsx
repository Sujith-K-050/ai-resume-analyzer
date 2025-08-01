import { useParams, Link, useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { usePuterStore } from "~/lib/puter";
import Summary from "~/components/Summary";
import ATS from "~/components/ATS";
import Details from "~/components/Details";

export const meta = () => [
  { title: "Resumind | Review" },
  { name: "description", content: "Detailed overview of your Resume" },
];

const resume = () => {
  const { auth, isLoading, fs, kv } = usePuterStore();
  const { id } = useParams();
  const [imageUrl, setImageUrl] = useState("");
  const [resumeUrl, setResumeUrl] = useState("");
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !auth.isAuthenticated)
      navigate(`/auth?next=/resume:${id}`);
  }, [auth.isAuthenticated, isLoading]);

  useEffect(() => {
    const loadResume = async () => {
      const resume = await kv.get(`resume:${id}`);
      // console.log("Resume " + resume);

      if (!resume) return;

      const data = JSON.parse(resume);
      // console.log("data" + data);

      const resumeBlob = await fs.read(data.resumePath);
      // console.log("resumeBlob" + resumeBlob);

      if (!resumeBlob) return;

      const pdfBlob = new Blob([resumeBlob], { type: "application/pdf" });
      // console.log("pdfBlob" + pdfBlob);

      const resumeUrl = URL.createObjectURL(pdfBlob);
      // console.log("resumeURL" + resumeUrl);

      setResumeUrl(resumeUrl);

      const imageBlob = await fs.read(data.imagePath);
      // console.log("imageBlob" + imageBlob);

      if (!imageBlob) return;

      const imageUrl = URL.createObjectURL(imageBlob);
      // console.log("ImageUrl" + imageUrl);
      setImageUrl(imageUrl);

      setFeedback(data.feedback);
    };

    loadResume();
  }, [id]);

  return (
    <main className="!p-0">
      <nav className="resume=nav">
        <Link to="/" className="back-button">
          <img src="/icons/back.svg" alt="BackLogo" className="w-2.5 h-2.5" />
          <span className="text-gray-800 text-sm font-semibold">
            Back to Home Page
          </span>
        </Link>
      </nav>

      <div className="flex flex-row w-full max-lg:flex-xol-reverse">
        <section className="feedback-section bg-[url('/images/bg-small.svg')] bg-cover h-[100vh] sticky top-0 items-center justify-center">
          {imageUrl && resumeUrl && (
            <div className="animate-in fade-in duration-1000 gradient-border max-sm:m-0 h-[90%] max-wxl:h-fit w-fit">
              <a href={resumeUrl} target="_blank" rel="noopener noreferer">
                <img
                  src={imageUrl}
                  className="w-full h-full object-contain rounded-2xl"
                  title="resume"
                />
              </a>
            </div>
          )}
        </section>

        <section className="feedback-section">
          <h2 className="text-4xl !text-black font-bold">Resume Review</h2>
          {feedback ? (
            <div className="flex flex-col gap-8 animate-in fade-in duration-1000 ">
              <Summary feedback={feedback} />
              <ATS
                score={feedback.ATS.score || 0}
                suggestions={feedback.padStart.tips || []}
              />
              <Details feedback={feedback} />
            </div>
          ) : (
            <img src="/images/resume-scan-2.gif" className="w-full" />
          )}
        </section>
      </div>
    </main>
  );
};

export default resume;
