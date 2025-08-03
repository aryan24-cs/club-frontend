export async function getCroppedImg(imageSrc, pixelCrop, outputFormat = "image/jpeg", quality = 0.8) {
    try {
        // Validate inputs
        if (!imageSrc || !pixelCrop) {
            throw new Error("Missing image source or crop parameters");
        }

        // Create image element
        const image = new Image();
        image.src = imageSrc;

        // Wait for image to load
        await new Promise((resolve, reject) => {
            image.onload = resolve;
            image.onerror = () => reject(new Error("Failed to load image"));
        });

        // Validate pixelCrop values
        if (
            !pixelCrop.width ||
            !pixelCrop.height ||
            pixelCrop.width <= 0 ||
            pixelCrop.height <= 0
        ) {
            throw new Error("Invalid crop dimensions");
        }

        // Create canvas
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        if (!ctx) {
            throw new Error("Failed to get canvas context");
        }

        canvas.width = pixelCrop.width;
        canvas.height = pixelCrop.height;

        // Draw cropped image
        ctx.drawImage(
            image,
            pixelCrop.x,
            pixelCrop.y,
            pixelCrop.width,
            pixelCrop.height,
            0,
            0,
            pixelCrop.width,
            pixelCrop.height
        );

        // Validate output format
        const supportedFormats = ["image/jpeg", "image/png", "image/webp"];
        if (!supportedFormats.includes(outputFormat)) {
            console.warn(`Unsupported format ${outputFormat}, defaulting to image/jpeg`);
            outputFormat = "image/jpeg";
        }

        // Return data URL
        const dataUrl = canvas.toDataURL(outputFormat, quality);
        if (!dataUrl) {
            throw new Error("Failed to generate cropped image data URL");
        }

        return dataUrl;
    } catch (err) {
        console.error("Error in getCroppedImg:", {
            message: err.message,
            imageSrc,
            pixelCrop,
        });
        throw err; // Rethrow to be handled by caller
    }
}