"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

export default function TestDetails() {
  const { testId } = useParams();
  const router = useRouter();

  const [test, setTest] = useState(null);
  const [checked, setChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [attemptInfo, setAttemptInfo] = useState(null);
  useEffect(() => {
    fetchTest();
  }, []);

  const fetchTest = async () => {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/user/test/${testId}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      }
    );
    const data = await res.json();
   // console.log(data.test);
    setTest(data.test);
    setAttemptInfo(data.attemptInfo);
  };

  const handleStart = async () => {
    if (!checked) return;
  
    if (attemptInfo.action === "resume") {
      router.push(
        `/user/test/${testId}/attempt/${attemptInfo.activeAttemptId}?agreed=${checked}`
      );
      return;
    }
  
    // start or reattempt → call API
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/tests/${testId}/start`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`
      }
    });
  
    const data = await res.json();
    
    if (res.ok) {
      //console.log("Test started:", data);
      router.push(
        `/user/test/${testId}/attempt/${data?.attemptId}?agreed=${checked}`
      );
    }
  };
  const getButtonText = () => {
    if (!attemptInfo) return "Start Test";
  
    switch (attemptInfo.action) {
      case "resume":
        return "Resume Test";
      case "reattempt":
        return "Re-attempt";
      default:
        return "Start Test";
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-100">
      <div className="bg-white p-6 rounded shadow w-full max-w-xl">

        <h1 className="text-xl font-bold mb-2">{test?.title}</h1>
        <p className="text-gray-600 mb-4">{test?.description}</p>

        <div className="space-y-2 mb-4">
          <p>Duration: {test?.duration} mins</p>
          <p>Total Questions: {test?.questions?.length}</p>
          <p>Total Marks: {test?.totalMarks}</p>
        </div>

        {/* CHECKBOX */}
        <div className="flex items-center gap-2 mb-4">
          <input
            type="checkbox"
            checked={checked}
            onChange={() => setChecked(!checked)}
          />
          <label>I have read all instructions</label>
        </div>

        <button
          disabled={!checked || loading}
          onClick={handleStart}
          className="w-full bg-blue-600 text-white py-2 rounded disabled:bg-gray-400"
        >
          {loading ? "Loading..." : getButtonText()}
        </button>
      </div>
    </div>
  );
}