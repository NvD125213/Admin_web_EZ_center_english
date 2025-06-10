import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";
import SignInForm from "../../components/auth/SignInForm";

export default function SignIn() {
  return (
    <>
      <PageMeta
        title="Hệ thống đăng nhập"
        description="Hệ thống đăng nhập trung tâm tiếng Anh EZ"
      />
      <AuthLayout>
        <SignInForm />
      </AuthLayout>
    </>
  );
}
