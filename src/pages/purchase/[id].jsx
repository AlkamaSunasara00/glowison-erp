import { useRouter } from "next/router";
import PurchaseDetail from "@/components/purchase/PurchaseDetail";

const PurchaseDetailPage = () => {
  const router = useRouter();
  const { id } = router.query;

  return (
    <PurchaseDetail itemId={id} />
  );
};

export default PurchaseDetailPage;
