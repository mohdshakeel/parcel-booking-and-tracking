export default function Footer() {
  return (
    <footer className="border-t bg-white border-gray-200 shadow-sm mt-8">
      <div className="max-w-6xl mx-auto text-center py-4 text-sm text-gray-500">
        © {new Date().getFullYear()} Parcel Booking. All rights reserved.
      </div>
    </footer>
  );
}
