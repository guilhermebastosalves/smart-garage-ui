import Header from "../Header";
import { useLocation } from "react-router-dom";


const Venda = () => {

    const location = useLocation();
    const automovelId = location.state?.automovelId;
    // const clienteId = location.state?.clienteId;

    console.log(automovelId);


    return (
        <>
            <Header />
            <h1>
                Venda
            </h1>
        </>
    )
}

export default Venda;