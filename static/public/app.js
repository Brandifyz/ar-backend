const compiler = new MINDAR.IMAGE.Compiler();

// const download = (buffer) => {
//   var blob = new Blob([buffer]);
//   var aLink = window.document.createElement("a");
//   aLink.download = "targets.mind";
//   // console.log(window.URL.createObjectURL(blob));
//   aLink.href = window.URL.createObjectURL(blob);
//   aLink.click();
//   window.URL.revokeObjectURL(aLink.href);
// };
const downloadAndUpload = async (buffer, id) => {
  try {
    var blob = new Blob([buffer]);
    var formData = new FormData();
    formData.append("file", blob, "targets.mind");

    const response = await fetch(
      `http://localhost:4000/api/v1/user/updatepropject/${id}`,
      {
        method: "PUT",
        body: formData,
        credentials: "include",
      }
    );

    if (!response.ok) {
      throw new Error("Failed to upload file to Cloudinary");
    }

    const data = await response.json();
    console.log("File uploaded to Cloudinary:", data);
    // window.location.href = "http://localhost:3000/userdashboard";
    window.location.href = "https://ar-visual.vercel.app/userdashboard";
  } catch (error) {
    console.error("Error uploading file to Cloudinary:", error);
  }
};

const download = (buffer, id) => {
  downloadAndUpload(buffer, id);
};
const loadImage = async (url) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous"; // Set crossOrigin to anonymous
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
};

const compileFiles = async (url, id) => {
  const images = [];
  images.push(await loadImage(url));
  let _start = new Date().getTime();
  const dataList = await compiler.compileImageTargets(images, (progress) => {
    document.getElementById("progress").innerHTML =
      "progress: " + progress.toFixed(2) + "%";
  });
  const exportedBuffer = await compiler.exportData();
  download(exportedBuffer, id);
};

function handleFiles(files, id) {
  compileFiles(files, id);
}

async function fetchAndSortData() {
  try {
    const response = await fetch(
      `http://localhost:4000/api/v1/user/allproject`,
      {
        method: "GET",
        credentials: "include", // Use 'include' to send cookies along with the request
      }
    );
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const data = await response.json();
    console.log(data);
    console.log("Project", data?.project?.project_report[0]?.target?.url);
    const target = data?.project?.project_report[0]?.target?.url;
    const id = data?.project?.project_report[0]?._id;
    handleFiles(target, id);
    // Process the data and set state or perform other actions
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}
