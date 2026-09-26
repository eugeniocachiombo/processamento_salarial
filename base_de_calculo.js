const dados = {
    salario_base: 170000.00,
    dias_uteis: 22,
    faltas: {
        fj: 0,
        fi: 0,
        total: 0,
    },
    subsidios: {
        alimentacao: 0,
        transporte: 0,
        abono: 0,
        desempenho: 0,
        ferias: 0,
        natal: 0,
        renda: 0,
    },
    impostos: {
        inss: 0,
        irt: 0,
    },
    descontos: {
        total: 0,
        outros: 0,
        faltas_justificadas: 0,
        faltas_injustificadas: 0,
    },
    outros: {
        horas_extras: 7000,
    }, 
    salario_total: 0,
    salario_liquido: 0,
}

function faltas(){
    const totalSubsidios = somarTodos(dados.subsidios);
    let fj = ( totalSubsidios / dados.dias_uteis ) * dados.faltas.fj;
    let fi = ( ( dados.salario_base + totalSubsidios ) /  dados.dias_uteis ) * dados.faltas.fi;

    dados.faltas.total = somarTodos(dados.faltas);
    dados.descontos.faltas_justificadas = fj;
    dados.descontos.faltas_injustificadas = fi;
    dados.descontos.total = fj + fi;
}
faltas();

function inss(){
    const totalSubsidios = somarTodos(dados.subsidios);
    dados.impostos.inss = 0.03 * (dados.salario_base + totalSubsidios - dados.subsidios.abono - dados.descontos.total);
}
inss();

function irt(){
    const totalSubsidiosIRT = subsidiosIRT(dados.subsidios);

    const rendimentoBruto = dados.salario_base + totalSubsidiosIRT + dados.outros.horas_extras;
    const materiaColectavel = rendimentoBruto - dados.descontos.total - dados.impostos.inss;

    let irtCalculado = 0;
    
    if (materiaColectavel <= 150000) {
        irtCalculado = 0;
    } else if (materiaColectavel <= 200000) {
        irtCalculado = 12500 + (materiaColectavel - 150000) * 0.16;
    } else if (materiaColectavel <= 300000) {
        irtCalculado = 31250 + (materiaColectavel - 200000) * 0.18;
    } else if (materiaColectavel <= 500000) {
        irtCalculado = 49250 + (materiaColectavel - 300000) * 0.19;
    } else if (materiaColectavel <= 1000000) {
        irtCalculado = 87250 + (materiaColectavel - 500000) * 0.20;
    } else if (materiaColectavel <= 1500000) {
        irtCalculado = 187250 + (materiaColectavel - 1000000) * 0.21;
    } else if (materiaColectavel <= 2000000) {
        irtCalculado = 292250 + (materiaColectavel - 1500000) * 0.22;
    } else if (materiaColectavel <= 2500000) {
        irtCalculado = 402250 + (materiaColectavel - 2000000) * 0.23;
    } else if (materiaColectavel <= 5000000) {
        irtCalculado = 517250 + (materiaColectavel - 2500000) * 0.24;
    } else if (materiaColectavel <= 10000000) {
        irtCalculado = 1117250 + (materiaColectavel - 5000000) * 0.245;
    } else {
        irtCalculado = 2342250 + (materiaColectavel - 10000000) * 0.25;
    }

    dados.impostos.irt = Math.max(0, irtCalculado);
}
irt();

function descontos(){
    dados.descontos.total += (dados.impostos.inss + dados.impostos.irt)
}
descontos();

function salario_liquido(){
    const totalSubsidios = somarTodos(dados.subsidios);
    const totalIliquido = ( dados.salario_base + totalSubsidios + dados.outros.horas_extras);

    dados.salario_total = totalIliquido;
    dados.salario_liquido = totalIliquido - dados.descontos.total - dados.descontos.outros;
}
salario_liquido();


function somarTodos(dados) {
    return Object.values(dados).reduce((acumulador, atual) => acumulador + atual, 0);
}

function subsidiosIRT(subsidios){
    const sub_irt = {
        alimentacao: apto_irt(subsidios.alimentacao),
        transporte: apto_irt(subsidios.transporte),
        abono: subsidios.abono,
        desempenho: subsidios.desempenho,
        ferias: subsidios.ferias,
        natal: subsidios.natal,
        renda: subsidios.renda,
    };
    return somarTodos(sub_irt);
}

function apto_irt(valor){
    let limite = 30000;
    if(valor > limite){
        return valor - limite;
    }
    return 0;
}
console.log(dados);