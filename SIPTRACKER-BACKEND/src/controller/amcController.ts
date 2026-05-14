import { Request, Response } from "express";
import pool from "../poolManager";

const getAmcs = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await pool.query(
      `
      SELECT *
      FROM amcs
      ORDER BY amc_name ASC
      `,
    );

    res.status(200).json(result.rows);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({
      message: "Error fetching AMCs",
    });
  }
};

export { getAmcs };
