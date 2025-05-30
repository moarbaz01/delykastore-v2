"use client";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";

const Balance = ({ smileOneBalance, ghorBalance }) => {
  return (
    <main className="md:pl-72 md:py-6 md:px-6 px-4 min-h-screen bg-gray-900 text-white">
      <div className="mx-auto rounded-xl shadow-md overflow-hidden p-6">
        <h1 className="text-2xl font-bold mb-6">Account Balance</h1>

        <TableContainer
          sx={{ backgroundColor: "#1f2937" }}
          className="rounded-xl"
        >
          <Table>
            <TableHead className="bg-gray-600">
              <TableRow>
                <TableCell>Wallet</TableCell>
                <TableCell>Balance</TableCell>
                <TableCell>Currency</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {/* Wrap TableCells in a TableRow */}
              <TableRow>
                <TableCell>{smileOneBalance?.data.name}</TableCell>
                <TableCell>
                  {smileOneBalance?.data?.smile_points || 0}
                </TableCell>
                <TableCell>USD</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>{ghorBalance?.data?.name}</TableCell>
                <TableCell>{ghorBalance?.data?.balance || 0}</TableCell>
                <TableCell>USD</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </div>
    </main>
  );
};

export default Balance;
