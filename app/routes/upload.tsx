import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router";
import FileUploader from "~/components/FileUploader";
import Navbar from "~/components/navbar";
import { usePuterStore } from "~/lib/puter";
import { convertPdfToImage } from "~/lib/pdf2img";
import { generateUUID } from "~/lib/utils";
import { prepareInstructions } from "constants/index";

const Upload = () => {
  const { auth, isLoading, ai, fs, kv } = usePuterStore();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusText, setStatusText] = useState("");

  const [file, setFile] = useState<File | null>(null);

  const handleFileSelect = (file: File | null) => {
    setFile(file);
  };

  const handleAnalyze = async ({
    companyName,
    jobTitle,
    jobDescription,
    file,
  }: {
    companyName: String;
    jobTitle: String;
    jobDescription: String;
    file: File;
  }) => {
    setIsProcessing(true);
    setStatusText("Uploading the File ....");
    const uploadedFile = await fs.upload([file]);
    if (!uploadedFile) return setStatusText("Error : Failed to uplaod file");

    setStatusText("Converting to Image");
    const imageFile = await convertPdfToImage(file);
    // console.log(imageFile);
    // console.log(imageFile.file);
    if (!imageFile.file)
      return setStatusText("Error : Failed to convert PDF to Image !");

    setStatusText("Uploading the image");
    const uploadedImage = await fs.upload([imageFile.file]);
    // console.log(uploadedImage);
    if (!uploadedImage) return setStatusText("Error : Failed to uplaod Image");

    setStatusText("Preparing data ...");
    const uuid = generateUUID();

    const data = {
      id: uuid,
      resumePath: uploadedFile.path,
      imagePath: uploadedImage.path,
      companyName,
      jobTitle,
      jobDescription,
      feedback: "",
    };

    await kv.set(`resume:${uuid}`, JSON.stringify(data));
    setStatusText("Analyzing...");

    const feedback = await ai.feedback(
      uploadedFile.path,
      prepareInstructions({ jobTitle, jobDescription })
    );
    console.log(feedback);

    if (!feedback) return setStatusText("Error : Failed to Analyze resume");

    const feedbackText =
      typeof feedback.message.content === "string"
        ? feedback.message.content
        : feedback.message.content[0].text;

    data.feedback = JSON.parse(feedbackText);
    await kv.set(`resume:${uuid}`, JSON.stringify(data));
    setStatusText("Analysis completed, redirecting....");
    console.log(data);

    navigate(`/resume/${uuid}`);
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget.closest("form");

    if (!form) return;
    const formData = new FormData(form);

    const companyName = formData.get("company-name") as String;
    const jobTitle = formData.get("job-title") as String;
    const jobDescription = formData.get("job-description") as String;

    if (!file) return;
    // console.log(file);

    handleAnalyze({ companyName, jobTitle, jobDescription, file });
  };

  return (
    <main className="bg-[url('/images/bg-main.svg')] bg-cover">
      <Navbar />
      <section className="main-section">
        <div className="page-heading  p-16">
          <h1>Smart feedback for your dream job</h1>

          {isProcessing ? (
            <>
              <h2>{statusText}</h2>
              <img
                src="images/resume-scan.gif"
                alt="Image Scanning GIF"
                className="w-full"
              />
            </>
          ) : (
            <h2>Drop your resume for ATS score & improvement tips</h2>
          )}

          {!isProcessing && (
            <form
              id="upload-form"
              onSubmit={handleSubmit}
              className="flex flex-col gap-4 mt-8"
            >
              <div className="form-div">
                <label htmlFor="company-name">Company Name</label>
                <input
                  type="text"
                  name="company-name"
                  placeholder="Enter Company Name"
                  id="company-name"
                ></input>
              </div>

              <div className="form-div">
                <label htmlFor="job-title">Job Title</label>
                <input
                  type="text"
                  name="job-title"
                  placeholder="Enter Job Title"
                  id="job-title"
                ></input>
              </div>
              <div className="form-div">
                <label htmlFor="job-description">Job Description</label>
                <textarea
                  rows={5}
                  name="job-description"
                  placeholder="Enter Job Description"
                  id="job-description"
                ></textarea>
              </div>
              <div className="form-div">
                <label htmlFor="uploader">Uploader</label>
                <FileUploader onFileSelect={handleFileSelect} />
              </div>

              <button className="primary-button" type="submit">
                Analyze Resume
              </button>
            </form>
          )}
        </div>
      </section>
    </main>
  );
};

export default Upload;
