// routes/profileRoutes.js
import express from "express";
import { supabase } from "../supabaseClient.js";

const router = express.Router();

router.get("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const { data, error } = await supabase
      .from("users")
      .select("user_id, name, email, points_total, points_redeemable")
      .eq("user_id", id)
      .single();

    if (error) throw error;

    res.json(data);
  } catch (err) {
    console.error(" Profile fetch error:", err);
    res.status(500).json({ error: "Failed to fetch user profile" });
  }
});

export default router;
