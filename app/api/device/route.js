import DeviceDetector from "node-device-detector";

export async function GET(req) {
  try {
    // Device Detector
    const detector = new DeviceDetector({
      clientIndexes: true,
      deviceIndexes: true,
      deviceAliasCode: false,
    });

    // User Agent
    const userAgent = req.headers.get("user-agent") || "";

    // Detect Device Info
    const device = detector.detect(userAgent);

    // Get Public IP
    const ipRes = await fetch("https://api.ipify.org?format=json");

    const ipData = await ipRes.json();

    const publicIp = ipData.ip;

    // Final Response
    return Response.json({
      success: true,

      ip: publicIp,

      deviceInfo: {
        browser: device.client?.name || "Unknown",
        browserVersion: device.client?.version || "Unknown",

        os: device.os?.name || "Unknown",
        osVersion: device.os?.version || "Unknown",

        deviceType: device.device?.type || "desktop",
        brand: device.device?.brand || "Unknown",
        model: device.device?.model || "Unknown",

        userAgent,
      },
    });
  } catch (error) {
    console.error(error);

    return Response.json(
      {
        success: false,
        message: "Failed to get device info",
      },
      { status: 500 }
    );
  }
}

// import DeviceDetector from "device-detector-js";
