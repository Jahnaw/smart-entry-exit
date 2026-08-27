const API_BASE_URL = "http://localhost:5000/api";

export const signupStudent = async (studentData) => {
  const response = await fetch(`${API_BASE_URL}/auth/signup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(studentData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Signup failed");
  }

  return data;
};

export const loginStudent = async (credentials) => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credentials),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Login failed");
  }

  return data;
};

export const getStudentProfile = async (token) => {
  const response = await fetch(`${API_BASE_URL}/student/profile`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch profile");
  }

  return data;
};

export const registerDevice = async (
  token,
  deviceToken
) => {
  const headers = {
    Authorization: `Bearer ${token}`,
  };

  if (deviceToken) {
    headers["X-Device-Token"] = deviceToken;
  }

  const response = await fetch(
    `${API_BASE_URL}/device/register`,
    {
      method: "POST",
      headers,
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Device verification failed"
    );
  }

  return data;
};

export const getGateByQrToken = async (
  qrToken
) => {
  const response = await fetch(
    `${API_BASE_URL}/gates/qr/${encodeURIComponent(
      qrToken
    )}`
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Unable to identify gate"
    );
  }

  return data;
};

export const verifyLocation = async ({
  token,
  deviceToken,
  qrToken,
  latitude,
  longitude,
  accuracy,
}) => {
  const response = await fetch(
    `${API_BASE_URL}/geofence/verify`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "X-Device-Token": deviceToken,
      },
      body: JSON.stringify({
        qrToken,
        latitude,
        longitude,
        accuracy,
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Location verification failed"
    );
  }

  return data;
};

export const markAttendance = async ({
  token,
  deviceToken,
  qrToken,
  latitude,
  longitude,
  accuracy,
}) => {
  const response = await fetch(
    `${API_BASE_URL}/attendance/mark`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "X-Device-Token": deviceToken,
      },
      body: JSON.stringify({
        qrToken,
        latitude,
        longitude,
        accuracy,
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Unable to mark attendance"
    );
  }

  return data;
};

export const getAttendanceHistory = async ({
  token,
  deviceToken,
}) => {
  const response = await fetch(
    `${API_BASE_URL}/attendance/history`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "X-Device-Token": deviceToken,
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Unable to fetch attendance history"
    );
  }

  return data;
};