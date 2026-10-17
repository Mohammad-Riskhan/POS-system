import React from 'react';
import { Printer, X, CheckCircle, Receipt, ArrowRight } from 'lucide-react';
import { formatCurrency } from '../utils/formatCurrency';

export const ReceiptModal = ({ order, onClose }) => {
  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-emerald-600/20 via-slate-900 to-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-emerald-400">
            <CheckCircle className="w-5 h-5" />
            <h3 className="font-bold text-slate-100">Checkout Successful</h3>
          </div>
          <button
            id="close-receipt-btn"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Receipt Paper Container */}
        <div id="printable-receipt" className="p-6 overflow-y-auto space-y-4 font-mono text-xs bg-slate-950 text-slate-300 border-y border-slate-800/80">
          <div className="text-center space-y-1">
            <div className="font-extrabold text-base tracking-widest text-white uppercase">
              {order.bName || 'OmniPOS Store'}
            </div>
            <p className="text-[11px] text-slate-400">Official POS Tax Invoice</p>
            <p className="text-[11px] text-slate-500">Ref: {order.reference}</p>
          </div>

          <div className="border-t border-dashed border-slate-700 pt-3 space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-500">Date:</span>
              <span>{order.date ? new Date(order.date).toLocaleString() : new Date().toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Customer:</span>
              <span>{order.customerName || 'Walk-in Client'}</span>
            </div>
            {order.customerMobile && (
              <div className="flex justify-between">
                <span className="text-slate-500">Mobile:</span>
                <span>{order.customerMobile}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-slate-500">Payment:</span>
              <span className="font-bold text-emerald-400">{order.paymentMethod}</span>
            </div>
          </div>

          <div className="border-t border-dashed border-slate-700 pt-3">
            <div className="grid grid-cols-12 text-[11px] font-bold text-slate-400 pb-1 border-b border-slate-800">
              <span className="col-span-6">ITEM</span>
              <span className="col-span-2 text-center">QTY</span>
              <span className="col-span-4 text-right">PRICE</span>
            </div>
            <div className="divide-y divide-slate-800/50 pt-1">
              {order.items?.map((item, idx) => (
                <div key={idx} className="grid grid-cols-12 py-1.5 text-[11px]">
                  <span className="col-span-6 truncate font-sans text-slate-200">
                    {item.itemName}
                  </span>
                  <span className="col-span-2 text-center">{item.qty}</span>
                  <span className="col-span-4 text-right">
                    {formatCurrency(item.grandTotal)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t-2 border-dashed border-slate-700 pt-3 space-y-1 text-sm">
            <div className="flex justify-between font-bold text-white text-base">
              <span>GRAND TOTAL:</span>
              <span className="text-emerald-400">
                {formatCurrency(order.grandTotal)}
              </span>
            </div>
          </div>

          <div className="text-center pt-3 text-[10px] text-slate-500 border-t border-dashed border-slate-800">
            <p>Thank you for shopping with us!</p>
            <p className="tracking-widest mt-0.5">*** OMNIPOS CLOUD ***</p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-900 border-t border-slate-800 flex items-center justify-end gap-3">
          <button
            id="print-receipt-action-btn"
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
          >
            <Printer className="w-4 h-4 text-slate-400" />
            Print Receipt
          </button>
          <button
            id="done-receipt-action-btn"
            onClick={onClose}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition-colors"
          >
            <span>Next Customer</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
