import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { updateMember, fetchMembers } from "../../slices/membersSlice";

const EditMember = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { members } = useSelector((state) => state.members);
  const member = members.find((m) => m.id.toString() === id);

  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    email: "",
    status: "active",
    borrowedBooksCount: 0,
    image: ""
  });

  useEffect(() => {
    if (!members.length) {
      dispatch(fetchMembers());
    }
  }, [dispatch, members.length]);

  useEffect(() => {
    if (member) {
      setFormData({
        firstname: member.firstname || "",
        lastname: member.lastname || "",
        email: member.email || "",
        status: member.status || "active",
        borrowedBooksCount: member.borrowedBooksCount || 0,
        image: member.image || ""
      });
    }
  }, [member]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(updateMember({ id, ...formData }));
    navigate("/dashboard/members");
  };

  if (!member) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading member details...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8 flex justify-center">
      <div className="w-full max-w-2xl bg-white shadow-lg rounded-2xl p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">✏️ Edit Member</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* First Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700">First Name</label>
            <input
              type="text"
              name="firstname"
              value={formData.firstname}
              onChange={handleChange}
              className="mt-1 w-full px-4 py-2 border rounded-xl shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>

          {/* Last Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Last Name</label>
            <input
              type="text"
              name="lastname"
              value={formData.lastname}
              onChange={handleChange}
              className="mt-1 w-full px-4 py-2 border rounded-xl shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="mt-1 w-full px-4 py-2 border rounded-xl shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="mt-1 w-full px-4 py-2 border rounded-xl shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {/* Borrowed Books Count */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Borrowed Books</label>
            <input
              type="number"
              name="borrowedBooksCount"
              value={formData.borrowedBooksCount}
              onChange={handleChange}
              className="mt-1 w-full px-4 py-2 border rounded-xl shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* Image */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Profile Image URL</label>
            <input
              type="text"
              name="image"
              value={formData.image}
              onChange={handleChange}
              className="mt-1 w-full px-4 py-2 border rounded-xl shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
            {formData.image && (
              <img
                src={formData.image}
                alt="Preview"
                className="mt-4 w-24 h-24 rounded-full object-cover"
              />
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full py-3 px-4 bg-indigo-600 text-white font-medium rounded-xl shadow-md hover:bg-indigo-700 hover:shadow-lg transition"
          >
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditMember;
