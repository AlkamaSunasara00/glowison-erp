import { useRouter } from "next/router";
import SupplierDetail from "@/components/suppliers/SupplierDetail";

const SupplierDetailPage = () => {
  const router = useRouter();
  const { id } = router.query;

  return (
    <SupplierDetail itemId={id} />
  );
};

export default SupplierDetailPage;
