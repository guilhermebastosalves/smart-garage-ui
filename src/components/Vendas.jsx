import Header from "./Header";
import React from "react";
import { useCallback } from "react";
import AutomovelDataService from "../services/automovelDataService";
import MarcaDataService from "../services/marcaDataService";
import ModeloDataService from "../services/modeloDataService";
import { useEffect } from "react";
import Select from "react-select";

const Vendas = () => {

    const [automovel, setAutomovel] = React.useState([]);
    const [marca, setMarca] = React.useState([]);
    const [modelo, setModelo] = React.useState([]);


    const retrieveAutomovel = useCallback(() => {
        AutomovelDataService.getAll()
            .then(response => {
                setAutomovel(response.data);
                // console.log("Automóveis carregados:", response.data);
            })
            .catch(e => {
                console.error("Erro ao buscar automóveis:", e);
            });
    }, []);


    useEffect(() => {
        retrieveAutomovel();
    }, [retrieveAutomovel]);


    const retrieveMarca = useCallback(() => {
        MarcaDataService.getAll()
            .then(response => {
                setMarca(response.data);
                // console.log("Marcas carregados:", response.data);
            })
            .catch(e => {
                console.error("Erro ao buscar marcas:", e);
            });
    }, []);

    useEffect(() => {
        retrieveMarca();
    }, [retrieveMarca]);


    const retrieveModelo = useCallback(() => {
        ModeloDataService.getAll()
            .then(response => {
                setModelo(response.data);
                // console.log("Modelos carregados:", response.data);
            })
            .catch(e => {
                console.error("Erro ao buscar modelos:", e);
            });
    }, []);

    useEffect(() => {
        retrieveModelo();
    }, [retrieveModelo]);

    const options = automovel.map((d) => {
        const nomeModelo = modelo.find(modelo => modelo.marcaId === d.marcaId);
        const nomeMarca = marca.find(marca => marca.id === d.marcaId);

        return {
            value: d.id,
            label: `${nomeModelo?.nome || ""} | ${nomeMarca?.nome || ""} | R$ ${d.valor} |  Renavam: ${d.renavam}`

            // label: <div className="row">
            //     <div className="col-md-12">
            //         {nomeModelo?.nome || ""}
            //     </div>
            //     <div className="col-md-6">
            //         {nomeMarca?.nome || ""}
            //     </div>
            //     <div className="col-md-6">
            //         R$ {d.valor}
            //     </div>
            // </div>


        };
    });


    return (
        <>
            <Header />
            <div className="container">
                <h1 className="mt-5">Vendas</h1>
                <p>Esta é a página de vendas.</p>
                {/* Aqui você pode adicionar mais conteúdo relacionado às vendas */}


                <div class="mb-3 col-md-3">
                    <label for="automovel" class="form-label">Automóvel</label>
                    <Select isSearchable={true} class="form-select" id="automovel" name="automovel" placeholder="Selecione um automóvel" options={options}>
                    </Select>
                </div>



            </div>
        </>
    );
}

export default Vendas;