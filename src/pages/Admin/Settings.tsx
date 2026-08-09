import { useEffect, useState } from "react";
import {
  doc,
  getDoc,
  setDoc,
} from "firebase/firestore";
import toast from "react-hot-toast";

import AdminLayout from "../../components/admin/AdminLayout";
import Button from "../../components/ui/Button";
import Loading from "../../components/ui/Loading";

import { db } from "../../services/firebase";

interface SettingsData {
  restaurantName: string;
  phone: string;
  address: string;
  gst: string;
  currency: string;
  upiId: string;
}

const defaultSettings: SettingsData = {
  restaurantName: "REDDY'S KITCHEN",
  phone: "",
  address: "",
  gst: "",
  currency: "INR",
  upiId: "",
};

function Settings() {
  const [settings, setSettings] =
    useState<SettingsData>(defaultSettings);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    async function loadSettings() {
      try {
        const snapshot = await getDoc(
          doc(db, "settings", "restaurant")
        );

        if (snapshot.exists()) {
          setSettings({
            ...defaultSettings,
            ...(snapshot.data() as SettingsData),
          });
        }
      } catch {
        toast.error(
          "Failed to load settings."
        );
      } finally {
        setLoading(false);
      }
    }

    loadSettings();
  }, []);

  function updateField(
    field: keyof SettingsData,
    value: string
  ) {
    setSettings((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  async function saveSettings() {
    try {
      await setDoc(
        doc(db, "settings", "restaurant"),
        settings
      );

      toast.success(
        "Settings saved successfully."
      );
    } catch {
      toast.error(
        "Failed to save settings."
      );
    }
  }

  if (loading) {
    return (
      <AdminLayout title="Settings">
        <Loading />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Settings">
      <div className="max-w-3xl mx-auto space-y-6">

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8">

          <h2 className="text-2xl font-bold mb-6">
            Restaurant Information
          </h2>

          <div className="grid gap-6">

            <div>
              <label className="block mb-2 text-sm text-gray-400">
                Restaurant Name
              </label>

              <input
                type="text"
                value={settings.restaurantName}
                onChange={(e) =>
                  updateField(
                    "restaurantName",
                    e.target.value
                  )
                }
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3"
              />
            </div>

            <div>
              <label className="block mb-2 text-sm text-gray-400">
                Phone Number
              </label>

              <input
                type="text"
                value={settings.phone}
                onChange={(e) =>
                  updateField("phone", e.target.value)
                }
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3"
              />
            </div>

            <div>
              <label className="block mb-2 text-sm text-gray-400">
                Address
              </label>

              <textarea
                rows={3}
                value={settings.address}
                onChange={(e) =>
                  updateField(
                    "address",
                    e.target.value
                  )
                }
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 resize-none"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">

              <div>
                <label className="block mb-2 text-sm text-gray-400">
                  GST Number
                </label>

                <input
                  type="text"
                  value={settings.gst}
                  onChange={(e) =>
                    updateField("gst", e.target.value)
                  }
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3"
                />
              </div>

              <div>
                <label className="block mb-2 text-sm text-gray-400">
                  Currency
                </label>

                <input
                  type="text"
                  value={settings.currency}
                  onChange={(e) =>
                    updateField(
                      "currency",
                      e.target.value
                    )
                  }
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3"
                />
              </div>

            </div>

            <div>
              <label className="block mb-2 text-sm text-gray-400">
                UPI ID
              </label>

              <input
                type="text"
                value={settings.upiId}
                onChange={(e) =>
                  updateField("upiId", e.target.value)
                }
                placeholder="example@upi"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3"
              />
            </div>

          </div>

          <div className="mt-8 flex justify-end">

            <Button
              variant="success"
              onClick={saveSettings}
            >
              Save Settings
            </Button>

          </div>

        </div>

      </div>

    </AdminLayout>
  );
}

export default Settings;