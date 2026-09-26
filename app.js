function formatarCampoMoeda(el) {
    let v = el.value.replace(/[^\d,]/g, '');

    const primeiraVirgula = v.indexOf(',');
    if (primeiraVirgula !== -1) {
        let parteInteira = v.slice(0, primeiraVirgula).replace(/^0+(?=\d)/, '');
        let parteDecimal = v.slice(primeiraVirgula + 1).replace(/,/g, '').slice(0, 2);
        if (parteInteira === '') parteInteira = '0';
        el.value = Number(parteInteira).toLocaleString('pt-PT') + ',' + parteDecimal;
    } else {
        v = v.replace(/^0+(?=\d)/, '');
        if (v === '') { el.value = ''; return; }
        el.value = Number(v).toLocaleString('pt-PT');
    }
}

function valorNumerico(id) {
    const el = document.getElementById(id);
    let v = el.value.replace(/\s/g, '');
    if (v.includes(',')) {
        v = v.replace(/\./g, '').replace(',', '.');
    } else {
        v = v.replace(/\./g, '');
    }
    const n = parseFloat(v);
    return isNaN(n) ? 0 : n;
}

let dados = {};

function lerDadosDosInputs() {
    dados = {
        salario_base: valorNumerico('in_salario_base'),
        dias_uteis: document.getElementById('in_dias_uteis').valueAsNumber || 0,
        faltas: {
            fj: document.getElementById('in_fj').valueAsNumber || 0,
            fi: document.getElementById('in_fi').valueAsNumber || 0,
            total: 0,
        },
        subsidios: {
            alimentacao: valorNumerico('sub_alimentacao'),
            transporte: valorNumerico('sub_transporte'),
            abono: valorNumerico('sub_abono'),
            desempenho: valorNumerico('sub_desempenho'),
            ferias: valorNumerico('sub_ferias'),
            natal: valorNumerico('sub_natal'),
            renda: valorNumerico('sub_renda'),
        },
        impostos: {
            inss: 0,
            irt: 0,
        },
        descontos: {
            total: 0,
            outros: valorNumerico('descontos_outros'),
            faltas_justificadas: 0,
            faltas_injustificadas: 0,
        },
        outros: {
            horas_extras: valorNumerico('outros_horas_extras'),
        },
        salario_total: 0,
        salario_liquido: 0,
    };
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

function inss(){
    const totalSubsidios = somarTodos(dados.subsidios);
    dados.impostos.inss = 0.03 * (dados.salario_base + totalSubsidios - dados.subsidios.abono - dados.descontos.total);
}

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

function descontos(){
    dados.descontos.total += (dados.impostos.inss + dados.impostos.irt)
}

function salario_liquido(){
    const totalSubsidios = somarTodos(dados.subsidios);
    const totalIliquido = ( dados.salario_base + totalSubsidios + dados.outros.horas_extras);

    dados.salario_total = totalIliquido;
    dados.salario_liquido = totalIliquido - dados.descontos.total - dados.descontos.outros;
}

function somarTodos(obj) {
    return Object.values(obj).reduce((acumulador, actual) => acumulador + actual, 0);
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

function formatarKz(valor) {
    return (valor || 0).toLocaleString('pt-PT', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' AOA';
}

function render() {
    document.getElementById('res_salario_liquido').innerHTML =
        (dados.salario_liquido || 0).toLocaleString('pt-PT', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) +
        ' <span>AOA</span>';

    const pct = dados.salario_total > 0 ? (dados.salario_liquido / dados.salario_total) * 100 : 0;
    document.getElementById('lbl_percentual_liquido').textContent = pct.toFixed(1) + '% do Bruto';

    document.getElementById('res_salario_total').textContent = formatarKz(dados.salario_total);
    document.getElementById('res_total_descontos').textContent = formatarKz(dados.descontos.total + dados.descontos.outros);

    document.getElementById('res_inss').textContent = formatarKz(dados.impostos.inss);
    document.getElementById('res_irt').textContent = formatarKz(dados.impostos.irt);
    document.getElementById('res_fj').textContent = formatarKz(dados.descontos.faltas_justificadas);
    document.getElementById('res_fi').textContent = formatarKz(dados.descontos.faltas_injustificadas);
    document.getElementById('res_outros_descontos').textContent = formatarKz(dados.descontos.outros);

    document.getElementById('res_base').textContent = formatarKz(dados.salario_base);
    document.getElementById('res_subsidios').textContent = formatarKz(somarTodos(dados.subsidios));
    document.getElementById('res_horas_extras').textContent = formatarKz(dados.outros.horas_extras);
}

function calcular() {
    lerDadosDosInputs();
    faltas();
    inss();
    irt();
    descontos();
    salario_liquido();
    render();
}

function resetarDados() {
    document.getElementById('in_salario_base').value = (0).toLocaleString('pt-PT');
    document.getElementById('in_dias_uteis').value = 22;
    document.getElementById('in_fj').value = 0;
    document.getElementById('in_fi').value = 0;
    document.getElementById('sub_alimentacao').value = '0';
    document.getElementById('sub_transporte').value = '0';
    document.getElementById('sub_abono').value = '0';
    document.getElementById('sub_desempenho').value = '0';
    document.getElementById('sub_ferias').value = '0';
    document.getElementById('sub_natal').value = '0';
    document.getElementById('sub_renda').value = '0';
    document.getElementById('outros_horas_extras').value = (0).toLocaleString('pt-PT');
    document.getElementById('descontos_outros').value = '0';
    calcular();
}

document.querySelectorAll('input.money').forEach(el => {
    el.addEventListener('input', calcular);
    el.addEventListener('blur', () => { formatarCampoMoeda(el); calcular(); });
});
document.querySelectorAll('input.dado:not(.money)').forEach(el => {
    el.addEventListener('input', calcular);
});

document.querySelectorAll('input.money').forEach(formatarCampoMoeda);
calcular();