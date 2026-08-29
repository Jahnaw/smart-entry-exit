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

export const getAdminDashboard = async (token) => {
  const response = await fetch(
    `${API_BASE_URL}/admin/dashboard`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Unable to fetch admin dashboard"
    );
  }

  return data;
};

export const getAllGates = async (token) => {
  const response = await fetch(
    `${API_BASE_URL}/gates`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Unable to fetch gates"
    );
  }

  return data;
};

export const createGate = async ({
  token,
  name,
  type,
  hostelId,
  latitude,
  longitude,
  radius,
}) => {
  const response = await fetch(
    `${API_BASE_URL}/gates`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name,
        type,
        hostelId,
        latitude,
        longitude,
        radius,
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Unable to create gate"
    );
  }

  return data;
};

export const updateGate = async ({
  token,
  id,
  name,
  type,
  hostelId,
  latitude,
  longitude,
  radius,
  active,
}) => {
  const response = await fetch(
    `${API_BASE_URL}/gates/${id}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name,
        type,
        hostelId,
        latitude,
        longitude,
        radius,
        active,
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Unable to update gate"
    );
  }

  return data;
};

export const deleteGate = async ({
  token,
  id,
}) => {
  const response = await fetch(
    `${API_BASE_URL}/gates/${id}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Unable to delete gate"
    );
  }

  return data;
};

export const getGateQrCode = async ({
  token,
  id,
}) => {
  const response = await fetch(
    `${API_BASE_URL}/gates/${id}/qr`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Unable to generate gate QR"
    );
  }

  return data;
};

export const getAllStudents = async (token) => {
  const response = await fetch(
    `${API_BASE_URL}/student/admin/all`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Unable to fetch students"
    );
  }

  return data;
};

export const getAllAttendance = async (token) => {
  const response = await fetch(
    `${API_BASE_URL}/attendance/admin/all`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Unable to fetch attendance records"
    );
  }

  return data;
};

export const getActiveHostels = async () => {
  const response = await fetch(
    `${API_BASE_URL}/hostels/active`
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Unable to fetch hostels"
    );
  }

  return data;
};

export const createWarden = async ({
  token,
  name,
  email,
  password,
  phone,
  hostelId,
}) => {
  const response = await fetch(
    `${API_BASE_URL}/admin/wardens`,
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },

      body: JSON.stringify({
        name,
        email,
        password,
        phone,
        hostelId,
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Unable to create warden"
    );
  }

  return data;
};

export const getAllWardens = async (token) => {
  const response = await fetch(
    `${API_BASE_URL}/admin/wardens`,
    {
      method: "GET",

      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Unable to fetch wardens"
    );
  }

  return data;
};

export const deleteWarden = async ({
  token,
  id,
}) => {
  const response = await fetch(
    `${API_BASE_URL}/admin/wardens/${id}`,
    {
      method: "DELETE",

      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Unable to remove warden"
    );
  }

  return data;
};

export const getWardenDashboard = async (token) => {
  const response = await fetch(
    `${API_BASE_URL}/warden/dashboard`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Unable to fetch warden dashboard"
    );
  }

  return data;
};

export const getWardenStudents = async (token) => {
  const response = await fetch(
    `${API_BASE_URL}/student/warden/all`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Unable to fetch hostel students"
    );
  }

  return data;
};

export const getWardenAttendance = async (token) => {
  const response = await fetch(
    `${API_BASE_URL}/attendance/warden/all`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Unable to fetch hostel attendance"
    );
  }

  return data;
};

export const getGuardHostels = async (
  token
) => {
  const response = await fetch(
    `${API_BASE_URL}/guard/hostels`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data =
    await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Unable to fetch hostels"
    );
  }

  return data;
};

export const getGuardHostelStudents =
  async (
    token,
    hostelId
  ) => {
    const response = await fetch(
      `${API_BASE_URL}/guard/hostels/${hostelId}/students`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data =
      await response.json();

    if (!response.ok) {
      throw new Error(
        data.message ||
          "Unable to fetch hostel students"
      );
    }

    return data;
  };

  export const createGuard = async ({
  token,
  name,
  email,
  password,
  phone,
}) => {
  const response = await fetch(
    `${API_BASE_URL}/admin/guards`,
    {
      method: "POST",

      headers: {
        "Content-Type":
          "application/json",
        Authorization:
          `Bearer ${token}`,
      },

      body: JSON.stringify({
        name,
        email,
        password,
        phone,
      }),
    }
  );

  const data =
    await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Unable to create guard"
    );
  }

  return data;
};

export const getAllGuards = async (
  token
) => {
  const response = await fetch(
    `${API_BASE_URL}/admin/guards`,
    {
      method: "GET",

      headers: {
        Authorization:
          `Bearer ${token}`,
      },
    }
  );

  const data =
    await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Unable to fetch guards"
    );
  }

  return data;
};

export const deleteGuard = async ({
  token,
  id,
}) => {
  const response = await fetch(
    `${API_BASE_URL}/admin/guards/${id}`,
    {
      method: "DELETE",

      headers: {
        Authorization:
          `Bearer ${token}`,
      },
    }
  );

  const data =
    await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Unable to remove guard"
    );
  }

  return data;
};