import LoginForm from "../auth/LoginForm";
import SignupForm from "../auth/SignupForm";
function Templete({ formTemplete }) {
  return (
    <div className="pt-10">
      {formTemplete === "login" ? <LoginForm /> : <SignupForm />}
    </div>
  );
}

export default Templete;
