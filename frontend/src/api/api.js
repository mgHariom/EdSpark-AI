export const postQuiz = async ({ topic, explanation }) => {
    const res = await fetch("http://localhost:8000/quiz", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic, explanation })
    });
    if (!res.ok) throw new Error(await res.text());
    return await res.json();              // { topic, quiz: [...] }
  };
  