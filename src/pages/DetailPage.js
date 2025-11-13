import { Layout } from '@/pages/Layout';
import { ProductDetail } from '@/components';

export const DetailPage = ({ loading, product }) => {
  return Layout({
    pageType: 'detail',
    children: ProductDetail({ loading, product }),
  });
};
