import { Layout } from '@/pages/Layout';
import { ProductDetail } from '@/components';

export const DetailPage = ({ loading, product }) => {
  return Layout({
    children: ProductDetail({ loading, product }),
  });
};
