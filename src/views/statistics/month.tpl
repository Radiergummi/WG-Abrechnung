<!-- IMPORT partials/header.tpl -->
<nav class="statistics-navigation sub-navigation">
  <ul>
    <li>
      <a href="#" class="back-link">[[global:back]]</a>
    </li><li>
    <div class="select-box">
      <div class="select-toggle"><span class="fa fa-angle-down"></span><span class="select-title">[[global:months.{month}]]</span></div>
      <ul>
        <li><a href="/statistics/january">[[global:months.january]]</a></li>
        <li><a href="/statistics/february">[[global:months.february]]</a></li>
        <li><a href="/statistics/march">[[global:months.march]]</a></li>
        <li><a href="/statistics/april">[[global:months.april]]</a></li>
        <li><a href="/statistics/may">[[global:months.may]]</a></li>
        <li><a href="/statistics/june">[[global:months.june]]</a></li>
        <li><a href="/statistics/july">[[global:months.july]]</a></li>
        <li><a href="/statistics/august">[[global:months.august]]</a></li>
        <li><a href="/statistics/september">[[global:months.september]]</a></li>
        <li><a href="/statistics/october">[[global:months.october]]</a></li>
        <li><a href="/statistics/november">[[global:months.november]]</a></li>
        <li><a href="/statistics/december">[[global:months.december]]</a></li>
      </ul>
    </div>
  </li><li>
    <a href="/statistics/user">[[statistics:user_statistics]]</a>
  </li>
  </ul>
</nav>
<article class="statistics-main">
  <header>
    <h1>[[statistics:month_title, {monthName}]]</h1>
  </header>
  <section class="flat-spending-by-month month-{month}" data-month="{monthNumber}"></section>
</article>
<script src="/javascripts/statistics.month.js"></script>
<!-- IMPORT partials/footer.tpl -->
