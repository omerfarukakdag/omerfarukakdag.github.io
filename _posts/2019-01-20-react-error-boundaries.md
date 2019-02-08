---
layout: post
title: React Komponentlerinde Hata Yönetimi
lang: tr
blog: true
comments: false
social-share: false
---

Error Boundary (Hata Sınırı), React 16 ile birlikte sunulan, içerdiği komponentlerde meydana gelen JavaScript hatalarını yakalamak ve bu durumda alt komponentler yerine istenen şablonun (örneğin hata sayfası veya fallback UI) render (html çıktısını üretmek) edilmesini sağlamak için kullanılan bir React komponentidir.

* Komponentler için JavaScript catch {} bloğu gibi çalışır.
* Bir komponentin Error Boundary özelliği taşıyabilmesi için [Class Component](https://reactjs.org/docs/components-and-props.html) şeklinde tanımlanması gerekir.

Error Boundary sadece içerdiği komponentlerin render ve lifecycle metodları içerisinde meydana gelen hataları yakalamaktadır.Eğer Error Boundary komponentinin kendinde hata meydana gelirse hatayı, üzerinde (parent) bulunan en yakın Error Boundary komponentine iletir.

Error Boundary komponenti aşağıdaki durumlarda meydana gelen hataları **yakalamamaktadır**:
* Event handlers (Olay Yöneticileri: onClick,onChange,onBlur vb.)
  * (Render ve lifecycle metodlarının aksine komponentin render sürecinde yer almazlar.Dolayısıyla burada hata fırlatılsa bile render işlemi devam eder.)
  * Burada fırlatılan hataları yakalamak isterseniz try/catch bloğu kullanabilirsiniz.
* Asenkron kodlar (örneğin [setTimeout](https://developer.mozilla.org/ro/docs/Web/API/window.setTimeout), [requestAnimationFrame](https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame) callback fonksiyonu vb.)
* Server side rendering
* Error Boundary komponentinin kendi hataları

> Error Boundary komponenti tarafından yakalanmayan bir hata meydana gelirse React komponent ağacının tümü html çıktısından kaldırılır (unmount işlemi).

Bir komponentin Error Boundary özelliği taşıyabilmesi için  [**static getDerivedStateFromError()**](https://reactjs.org/docs/react-component.html#static-getderivedstatefromerror) veya [**componentDidCatch()**](https://reactjs.org/docs/react-component.html#componentdidcatch) metod tanımlarını içermesi gerekir.

**Bu metodlar farklı amaçlara hizmet etmek için tasarlanmıştır.**
 * **getDerivedStateFromError()**
     * Hata meydana geldikten hemen sonra çalışır ve render işlemi bu aşamada devam etmektedir.(DOM henüz güncellenmedi.)
     * Sadece hata bilgisini gönderir.
     * Hata oluşması durumu state'e atılabilir. 
     * Hata şablonunun (fallback UI) render edilmesine olanak sağlar.
 * **componentDidCatch()**
     * Hata detayını ve hatanın fırlatıldığı yer bilgisini gönderir.
     * Hataların loglanması gibi ek görevler için tasarlanmıştır.
     * Commit aşaması olarak da adlandırılır. (Bu işlemden sonra DOM güncellenecek.)
     * Bu metod tetiklendikten sonra hataya sebep olan komponent yerine null render edilmektedir.Ref kullanan parent komponentler için bu değerin boş olması sorun teşkil edecektir.

*UYARI: **Komponentin üzerinde state işlemlerini React 16 versiyonu ile ({hasError: true} gibi) componentDidCatch metodunda da yapabilirsiniz.Fakat bir sonraki React versiyonu itibariyle bu metod üzerinden state'e erişim kaldırılacak.***

![React Component Lifecycle](/assets/react/errorBoundary/lifecycle.png)

**Komponentin örnek kullanımı aşağıdaki gibi olacaktır:**
```
<ErrorBoundary>
  <App>
   <Container />
  </App>
</ErrorBoundary>
```

* Error Boundary komponentinin içerdiği komponentlerin herhangi birinde hata meydana gelmesi diğer komponentlerin de render **edilmemesine** sebep olmaktadır.

```
<ErrorBoundary>
  <ComponentErrorFirst />
  <ComponentErrorSecond />
 </ErrorBoundary>
```

* Her Error Boundary komponenti kendi içerdiği komponentlerin hatalarından sorumludur.Aşağıdaki örnekteki gibi ComponentErrorFirst komponentinde meydana gelen hata ComponentErrorSecond komponentinin render edilmesini **etkilemeyecektir**.

```
<ErrorBoundary>
  <ComponentErrorFirst />
</ErrorBoundary>
<ErrorBoundary>
  <ComponentErrorSecond />
</ErrorBoundary>
```

### Neden try/catch bloğu kullanmıyoruz?

**Emirli Programlama (Imperative Programming):** Bilgisayar bilimlerinde, programlama dillerini sınıflandırmak ve bir programlama dilinin özelliklerini belirtmek için kullanılan bir terimdir.Bir programlama dilindeki komutların satır satır emirlerden oluşmasıdır.
* Programın hangi işlemleri yapacağı açıkça belirtilir.
* Nasıl sorusuna cevap verir.
> Derleyiciye ne yapmak istediğimizi adım adım kodlayarak anlatmamız bu paradigmaya örnek olarak verilebilir.
 
 - results isminde bir liste oluştur.
 - collection listesinde gezerek tüm elemanları kontrol et.
 - eğer eleman çift sayı ise results listesine ekle.

```
 var collection = new List<int> { 1, 2, 3, 4, 5 };
```

```
var results = new List<int>();
foreach(var num in collection)
{
    if (num % 2 == 0)
          results.Add(num);
}
``` 

**Tanımlı (Bildirimli) Programlama (Declarative Programming):** Emirli programlamanın aksine kontrol akışını belirtmeden çıktıya odaklanan programlama paradigmasıdır.

* İşlemin nasıl olduğuyla değil ne olduğuyla ilgilenir.
* Programın amaçladığı şey belirtilir (çıktı ne olmalı?).

 > *İnternet üzerinden bir ürün siparişi verdik mesela.Bu siparişin firmaya ulaştıktan sonra hangi aşamalardan geçtiği (ürün temini, üretim aşaması, bize ulaştırılana kadar hangi ulaşım yolunu kullandığı vb.) gibi kısımlarla ilgilenmiyoruz.Bizim amacımız o ürüne sahip olmak.*

 > Sayfamıza bir ```<Button />``` komponenti ekledik mesela.Burada amacımız ekranda bir button/input elementinin gösterilmesi.Komponentin html çıktısı üretilene kadar geçirdiği evreler bizim ilgilendiğimiz kısım değil.
 
***

**try/catch bloğu sadece emirli programlama konseptiyle çalışmaktadır.**

**React komponentleri ise tanımlı (bildirimli) programlama konseptine dayalıdır.Error Boundary komponentiyle de bu konseptin korunması amaçlanmıştır.**

***

TypeScript ile yazılan örnek Error Boundary komponenti aşağıda verilmiştir.

***React ve loglama servisinin import edilmesi:***
```
import React, { ComponentType } from 'react';
import logService from '../service/logService';
```

```
interface ErrorDetail {
    error: Error,
    errorInfo: React.ErrorInfo
}
interface ErrorBoundaryProps {
    ErrorViewComponent?: ComponentType<any>,
    isDevelopmentEnvironment?: boolean,
    onError?: (errorDetail: ErrorDetail) => void
}

interface ErrorBoundaryState {
    hasError: boolean,
    errorDetail?: ErrorDetail
};
```

***Hata detaylarını göstermek için tanımlanan şablon [(function component)](https://reactjs.org/docs/components-and-props.html):***
```
const DevelopmentEnvironmentErrorViewComponent = (props: ErrorDetail) => {
    return (
        <div>
            <h2>Development Environment ||| Oops! An error occured!</h2>
            <p><strong>Render error</strong></p>
            <p><strong>Error:</strong>{props.error.name}-{props.error.message}-{props.error.stack}</p>
            <p><strong>Stacktrace:</strong>{props.errorInfo ? props.errorInfo.componentStack : ''}</p>
        </div>
    );
};
```

```
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    static defaultProps = {
        isDevelopmentEnvironment: false,
        ErrorViewComponent: DevelopmentEnvironmentErrorViewComponent
    };

    constructor(props: ErrorBoundaryProps) {
        super(props);

        this.state = {
            hasError: false
        };

        this.windowOnError = this.windowOnError.bind(this);
        window.onerror = this.windowOnError;
    }
 
    /// Error Boundary komponentinin yakalayamadığı hatalar için kullanılabilir.  
    windowOnError(event: Event | string, source?: string, lineNo?: number, columnNumber?: number, error?: Error) {
        let errorMessage = `Message: ${event.toString().toLowerCase()} - Source: ${source} - Line: ${lineNo} - Column: ${columnNumber} - Error Object: ${error.name}-${error.message}-${error.stack}`;

        logService.error(errorMessage, "window.onerror");

        // When the function returns true, this prevents the firing of the default event handler.
        return true;
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        const { onError } = this.props;
        if (typeof onError === 'function') {
            try {
                onError({ error: error, errorInfo: errorInfo });
            } catch (ignoredError) { }
        }

        // Hata meydana geldiğinde hasError değişkenini true değeriyle state'e atıyoruz.
        // Bu değeri daha sonra render metodu içerisinde kullanacağız.
        this.setState({
            hasError: true,
            errorDetail: {
                error: error,
                errorInfo: errorInfo
            }
        });

        let errorMessage = `Error: ${error.name}-${error.message}-${error.stack}-Error Info: ${errorInfo.componentStack}`;
        logService.error(errorMessage, "componentDidCatch");
    }

    render() {
        // Hata oluşmadıysa alt komponentleri render et.
        if (!this.state.hasError)
            return this.props.children;

        const { errorDetail } = this.state;
        const { ErrorViewComponent } = this.props;

        if (!errorDetail)
            return;

        return (
            this.props.isDevelopmentEnvironment
                ? <DevelopmentEnvironmentErrorViewComponent {...errorDetail} />
                : <ErrorViewComponent error={errorDetail.error} componentStack={errorDetail.errorInfo ? errorDetail.errorInfo.componentStack : ''} />
        );
    }
}
```

### Unit Test

Test aşamasında [Jest](https://jestjs.io/) ve [Enzyme](https://airbnb.io/enzyme/) kütüphaneleri kullanılmıştır.

Test case'leri: 
* Error Boundary komponentini hata fırlatmayan bir komponentle kullanacağız.Dolayısıyla html çıktısında bu komponentin olması gerekiyor.

   ```
   <ErrorBoundary>
        <ComponentWithoutError />
   </ErrorBoundary>
   ```
* Error Boundary komponentini hata fırlatan bir komponentle kullanacağız.

  ```
   <ErrorBoundary>
        <ComponentWithError />
   </ErrorBoundary>
  ```
  * Hata fırlatıldığı için componentDidCatch metodunun çağrılmasını bekliyoruz.
  * Bu metod içerisindeki hasError değerinin de true olması gerekiyor.
  * window.onerror'a bind ettiğimiz metodun da çağrılmasını bekliyoruz.
  * Hata fırlatıldığı için alt komponentlerin html çıktısında olmamasını bekliyoruz.
  * Error Boundary komponentinden dışarıya açtığımız onError callback fonksiyonunun da çağrılmasını bekliyoruz.

```
import 'jest';
import React from 'react';
import { ErrorBoundary } from '../errorBoundary';
import { mount } from 'enzyme';
```

```
const ComponentWithError = () => {
  throw new Error('Error thrown from child component');
};

const ComponentWithRuntimeError = () => {
  let componentNames: string[] | undefined = undefined;
  let filteredList = componentNames.filter((name: string) => {
    return name.startsWith("purecomponent");
  });
  console.log(filteredList.join("-"));

  return (
    <div>Runtime error child component</div>
  );
};
```

```
const ComponentWithoutError = () => {
  return (
    <div>Child component</div>
  );
};
```

```
const UnitTestErrorViewComponent = (props: any) => {
  const error: Error = props.error;
  const componentStack: string = props.componentStack;
  return (
    <div>
      <h2>UNIT TEST ||| Oops! An error occured!</h2>
      <p><strong>Render error</strong></p>
      <p><strong>Error:</strong>{error.name}-{error.message}-{error.stack}</p>
      <p><strong>Stacktrace:</strong>{componentStack}</p>
    </div>
  );
};
```

```
describe('When no JavaScript errors are caught in a child component', () => {
  it('should render the child component', () => {
    const wrapper = mount(
      <ErrorBoundary isDevelopmentEnvironment>
        <ComponentWithoutError />
      </ErrorBoundary>
    );
    expect(wrapper.contains(<ComponentWithoutError />)).toBe(true);
  })
});
```

```
describe('When a JavaScript error is caught in a child component', () => {
  it('should catch errors with componentDidCatch', () => {
    const componentDidCatchSpy = jest.spyOn(ErrorBoundary.prototype, 'componentDidCatch');
    mount(
      <ErrorBoundary isDevelopmentEnvironment>
        <ComponentWithError />
      </ErrorBoundary>
    );
    expect(componentDidCatchSpy).toHaveBeenCalledTimes(1);
  })

  it('should catch errors with window.onerror', () => {
    const windowOnErrorSpy = jest.spyOn(ErrorBoundary.prototype, 'windowOnError');
    mount(
      <ErrorBoundary isDevelopmentEnvironment>
        <ComponentWithRuntimeError />
      </ErrorBoundary>
    );
    expect(windowOnErrorSpy).toHaveBeenCalledTimes(1);
  })

  it('should update the state to indicate an error', () => {
    const wrapper = mount(
      <ErrorBoundary isDevelopmentEnvironment>
        <ComponentWithError />
      </ErrorBoundary>
    );
    expect(wrapper.state("hasError")).toBeTruthy();
  })

  it('should not render the child component', () => {
    const wrapper = mount(
      <ErrorBoundary isDevelopmentEnvironment>
        <ComponentWithError />
      </ErrorBoundary>
    );
    expect(wrapper.contains(<ComponentWithError />)).toBe(false);
  })

  it('should call the onError callback function', () => {
    const onErrorCallback = jest.fn();
    mount(
      <ErrorBoundary ErrorViewComponent={UnitTestErrorViewComponent} onError={onErrorCallback}>
        <ComponentWithError />
      </ErrorBoundary>
    );
    expect(onErrorCallback).toHaveBeenCalledTimes(1);
  })
});
```

### Test Sonuçları
![Test Results](/assets/react/errorBoundary/test/test-results.PNG)

#### Örnek uygulamanın kaynak kodlarına aşağıdaki linklerden ulaşabilirsiniz.
[Komponent](/assets/react/errorBoundary/code/errorBoundary.tsx)

[Test](/assets/react/errorBoundary/code/tests/errorBoundaryTest.tsx)


Faydalı olması dileğiyle...