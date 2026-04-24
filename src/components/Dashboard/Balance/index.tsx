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
    <main className="md:pl-72 md:py-6 md:px-6 px-4 min-h-screen text-white">
      <div className="mx-auto  overflow-hidden p-6">
        <h1 className="text-2xl font-bold mb-6">Account Balance</h1>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Wallet</TableCell>
                <TableCell>Balance</TableCell>
                <TableCell>Currency</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {/* Wrap TableCells in a TableRow */}
              <TableRow hover>
                <TableCell>{smileOneBalance?.data.name}</TableCell>
                <TableCell>
                  {smileOneBalance?.data?.smile_points || 0}
                </TableCell>
                <TableCell>USD</TableCell>
              </TableRow>
              <TableRow hover>
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
