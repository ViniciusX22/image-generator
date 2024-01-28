let apiKey;

fetch("env.json")
  .then((res) => res.json())
  .then((data) => (apiKey = data.apiKey));

const submitIcon = document.querySelector("#submit-icon");
const input = document.querySelector("input");
const imagesSection = document.querySelector(".images-section");
const errorElement = document.querySelector(".error-message");

const setLoading = (loading) => {
  if (loading) {
    document.body.classList.add("loading");
    submitIcon.classList.add("loading");
    input.classList.add("loading");
  } else {
    document.body.classList.remove("loading");
    submitIcon.classList.remove("loading");
    input.classList.remove("loading");
  }
};

const getImages = async () => {
  Array.from(imagesSection.children).forEach((c) => c.remove());
  errorElement.innerHTML = "";

  try {
    const options = {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: input.value,
        n: 4,
        size: "1024x1024",
        response_format: "b64_json",
      }),
    };

    setLoading(true);

    const response = await fetch(
      "https://api.openai.com/v1/images/generations",
      options
    );
    const data = await response.json();

    setLoading(false);

    if (!response.ok) {
      if (data.error?.code === "rate_limit_exceeded") {
        errorElement.innerHTML =
          "Too much requests in one minute. Wait a moment before sending a new prompt.";
      } else if (data.error?.code === "content_policy_violation") {
        errorElement.innerHTML =
          "Your prompt was rejected due to possibly violating out content policy.";
      } else {
        errorElement.innerHTML =
          "Images could not be generated. Try again soon.";
      }
    } else {
      data?.data.forEach((image) => {
        const imgContainer = document.createElement("div");
        imgContainer.classList.add("image-container");
        const imgElement = new Image();
        imgElement.src = `data:image/png;base64,${image.b64_json}`;
        imgContainer.append(imgElement);
        imagesSection.append(imgContainer);
      });
    }
  } catch (e) {
    console.error(e);
    errorElement.innerHTML = "Images could not be generated. Try again soon.";
  }
};

submitIcon.addEventListener("click", getImages);
