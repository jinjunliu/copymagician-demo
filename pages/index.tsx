import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import { useRef, useState } from "react";
import { Toaster, toast } from "react-hot-toast";
import DropDown, { AudienceAge } from "../components/DropDown";
import Footer from "../components/Footer";
import Github from "../components/GitHub";
import Header from "../components/Header";
import LoadingDots from "../components/LoadingDots";
import ReactMarkdown from 'react-markdown';

const Home: NextPage = () => {
  const [loading, setLoading] = useState(false);
  const [product, setProduct] = useState("");
  const [age, setAge] = useState<AudienceAge>("18-30");
  const [generatedCampaign, setGeneratedCampaign] = useState<String>("");

  const productRef = useRef<null | HTMLDivElement>(null);

  const scrollToBios = () => {
    if (productRef.current !== null) {
      productRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const prompt = `As an advertiser, you'll create a campaign to promote a product or service by selecting a target audience, crafting key messages and slogans, choosing media channels for promotion, and planning additional activities to achieve your goals. First, detect the language (e.g., English, Chinese) of the name of the product or service, then generate the campaign. **Your whole reply should be in the same language of the product or service.** My first request is "Create an advertising campaign for ${
    product.endsWith(".") ? product.slice(0, -1) : product
  } targeting adults aged ${age}"`;

  // Add these new code here
const validationPrompt = `Analyze if the following input represents a product or service: "${product}"
Consider these guidelines:
- A product is a tangible or digital item that can be purchased
- A service is an action or work provided by one party to another
- Common nouns, abstract concepts, or random words are not valid
- A declarative or imperative sentence that does not involve any products or services is not valid.

Response format: Answer with only "yes" if it's clearly a product or service, or "no" if it's not.`;

const validateProduct = async () => {
  const response = await fetch("/api/generate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prompt: validationPrompt,
    }),
  });

  if (!response.ok) {
    throw new Error(response.statusText);
  }

  const data = response.body;
  if (!data) {
    return false;
  }

  const reader = data.getReader();
  const decoder = new TextDecoder();
  let result = "";
  
  let done = false;
  while (!done) {
    const { value, done: doneReading } = await reader.read();
    done = doneReading;
    const chunkValue = decoder.decode(value);
    result += chunkValue;
  }

  return result.toLowerCase().includes('yes');
};

const generateBio = async (e: any) => {
    e.preventDefault();
  
    if (!product.trim()) {
      toast.error("Please input a product or service.");
      return;
    }
  
    setLoading(true);
  
    try {
      // Validate first
      const isValid = await validateProduct();
      
      if (!isValid) {
        toast.error("Please input a valid product or service.");
        setLoading(false);
        return;
      }
  
      // If valid, proceed with campaign generation
      setGeneratedCampaign("");
      
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt,
        }),
      });
  
      if (!response.ok) {
        throw new Error(response.statusText);
      }
  
      const data = response.body;
      if (!data) {
        return;
      }
  
      const reader = data.getReader();
      const decoder = new TextDecoder();
      let done = false;
      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        const chunkValue = decoder.decode(value);
        setGeneratedCampaign((prev) => prev + chunkValue);
      }
      scrollToBios();
    } catch (error) {
      toast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex max-w-5xl mx-auto flex-col items-center justify-center py-2 min-h-screen">
      <Head>
        <title>Copy Magician</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Header />
      <main className="flex flex-1 w-full flex-col items-center justify-center text-center px-4 mt-12 sm:mt-20">
        <h1 className="sm:text-6xl text-4xl max-w-[708px] font-bold text-slate-900">
          Generate your ads campaign using AI
        </h1>
        <div className="max-w-xl w-full">
          <div className="flex mt-10 items-center space-x-3">
            <Image
              src="/1-black.png"
              width={30}
              height={30}
              alt="1 icon"
              className="mb-5 sm:mb-0"
            />
            <p className="text-left font-medium">
              Input the name of your product of service.
            </p>
          </div>
          <textarea
            value={product}
            onChange={(e) => setProduct(e.target.value)}
            rows={4}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black my-5"
            placeholder={
              "e.g. a new type of energy drink"
            }
          />
          <div className="flex mb-5 items-center space-x-3">
            <Image src="/2-black.png" width={30} height={30} alt="1 icon" />
            <p className="text-left font-medium">Select the age range of your targeted audience.</p>
          </div>
          <div className="block">
            <DropDown age={age} setAge={(newAge) => setAge(newAge)} />
          </div>

          {!loading && (
            <button
              className="bg-black rounded-xl text-white font-medium px-4 py-2 sm:mt-10 mt-8 hover:bg-black/80 w-full"
              onClick={(e) => generateBio(e)}
            >
              Generate your compaign &rarr;
            </button>
          )}
          {loading && (
            <button
              className="bg-black rounded-xl text-white font-medium px-4 py-2 sm:mt-10 mt-8 hover:bg-black/80 w-full"
              disabled
            >
              <LoadingDots color="white" style="large" />
            </button>
          )}
        </div>
        <Toaster
          position="top-center"
          reverseOrder={false}
          toastOptions={{ duration: 2000 }}
        />
        <hr className="h-px bg-gray-700 border-1 dark:bg-gray-700" />
        <div className="space-y-10 my-10">
        {generatedCampaign && (
  <>
    <div>
      <h2
        className="sm:text-4xl text-3xl font-bold text-slate-900 mx-auto"
        ref={productRef}
      >
        Your generated ads campaign.
      </h2>
    </div>
    <div className="space-y-8 flex flex-col items-center justify-center max-w-xl mx-auto">
      <div className="bg-white rounded-xl shadow-md p-4 border">
        <div className="prose">
          <ReactMarkdown>
            {generatedCampaign.valueOf()}
          </ReactMarkdown>
        </div>
        <button
          onClick={() => {
            navigator.clipboard.writeText(generatedCampaign.valueOf());
            toast("Text copied to clipboard", { icon: "✂️" });
          }}
          className="mt-2 px-4 py-2 bg-gray-100 rounded hover:bg-gray-200"
        >
          Copy to clipboard
        </button>
      </div>
    </div>
  </>
)}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Home;
