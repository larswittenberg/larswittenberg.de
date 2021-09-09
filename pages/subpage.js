import LayoutDefault from '../components/LayoutDefault'

export default function Subpage() {
	return (
		<LayoutDefault>
			<div className="prose prose-sm sm:prose lg:prose-lg mx-auto">
				<h1 className="">
					Demo-Page with @tailwindcss-typography Plugin
				</h1>
				<p className="lead">
					Until now, trying to style an article, document, or blog post with Tailwind has been a tedious task that required a keen eye for typography and a lot of complex custom CSS.
				</p>
				<p>
					Lorem ipsum, dolor sit amet consectetur adipisicing elit. Id corrupti maxime similique quisquam sunt quis vero culpa <em>awesome</em> ipsum ullam vel odit eligendi, quo illum, aliquid sequi quae. Possimus, dignissimos!
				</p>
				<blockquote>
					<p>Why is Tailwind removing the default styles on my
						<code>h1</code>
						elements? How do I disable this? What do you mean I lose all the other base
						styles too?
					</p>
				</blockquote>
				<p>The
					<code>@tailwindcss/typography</code>
					plugin is our attempt to give you what you
					<em>actually</em>
					want, without any of the downsides of doing something stupid like disabling our
					base styles.
				</p>
				<pre>
					<code className="language-html">&lt;article class="prose"&gt;
					&lt;h1&gt;Garlic bread with cheese: What the science tells us&lt;/h1&gt;
					&lt;p&gt;
						For years parents have espoused the health benefits of eating garlic bread with cheese to their
						children, with the food earning such an iconic status in our culture that kids will often dress
						up as warm, cheesy loaf for Halloween.
					&lt;/p&gt;
					&lt;p&gt;
						But a recent study shows that the celebrated appetizer may be linked to a series of rabies cases
						springing up around the country.
					&lt;/p&gt;
					&lt;!-- ... --&gt;
					&lt;/article&gt;
					</code>
				</pre>
				<p>
					For more information about how to use the plugin and the features it includes, <a href="https://github.com/tailwindcss/typography/blob/master/README.md">read the documentation</a>.
				</p>
				<hr />
				<h2>What to expect from here on out</h2>
				<p>
					Lorem ipsum, dolor sit amet consectetur adipisicing elit. Dignissimos nemo itaque culpa distinctio, sed facilis voluptate non temporibus assumenda, fuga, quisquam consequatur ea obcaecati eveniet iure laborum suscipit aliquid id?
				</p>
				<ol>
					<li>We want everything to look good out of the box.</li>
					<li>Really just the first reason, that's the whole point of the plugin.</li>
					<li>Here's a third pretend reason though a list with three items looks more
						realistic than a list with two items.
					</li>
				</ol>
				<p>Now we're going to try out another header style.</p>
				<h3>Typography should be easy</h3>
				<p>It's probably important that images look okay here by default as well:</p>
				<ul>
					<li>So here is the first item in this list.</li>
					<li>In this example we're keeping the items short.</li>
					<li>Later, we'll use longer, more complex list items.</li>
				</ul>
				<p>And that's the end of this section.</p>
				<h2>What if we stack headings?</h2>
				<h3>We should make sure that looks good, too.</h3>
				<p>
					Lorem ipsum dolor sit, amet consectetur adipisicing elit. Magnam voluptatem, quo aperiam nisi, error provident consectetur ex, culpa voluptates minus nihil voluptatibus natus nemo quibusdam laboriosam exercitationem dolor. Eveniet, assumenda?
				</p>
				<h3>When a heading comes after a paragraph …</h3>
				<p>
					When a heading comes after a paragraph, we need a bit more space, like I already mentioned above. Now let's see what a more complex list would look like.
				</p>
				<p>The most annoying thing about lists in Markdown is that
					<code>&lt;li&gt;</code>
					elements aren't given a child
					<code>&lt;p&gt;</code>
					tag unless there are multiple paragraphs in the list item. That means I have to
					worry about styling that annoying situation too.
				</p>
				<table>
					<thead>
						<tr>
							<th>Wrestler</th>
							<th>Origin</th>
							<th>Finisher</th>
						</tr>
					</thead>
					<tbody>
						<tr>
							<td>Bret "The Hitman" Hart</td>
							<td>Calgary, AB</td>
							<td>Sharpshooter</td>
						</tr>
						<tr>
							<td>Stone Cold Steve Austin</td>
							<td>Austin, TX</td>
							<td>Stone Cold Stunner</td>
						</tr>
						<tr>
							<td>Randy Savage</td>
							<td>Sarasota, FL</td>
							<td>Elbow Drop</td>
						</tr>
						<tr>
							<td>Vader</td>
							<td>Boulder, CO</td>
							<td>Vader Bomb</td>
						</tr>
						<tr>
							<td>Razor Ramon</td>
							<td>Chuluota, FL</td>
							<td>Razor's Edge</td>
						</tr>
					</tbody>
				</table>
				<p>
					Lorem ipsum dolor sit amet consectetur adipisicing elit. Alias eveniet odit magni dicta fuga assumenda, nam aperiam. Porro recusandae fuga, unde optio mollitia sint laborum ex beatae itaque, assumenda soluta?
				</p>
				<h4>We haven't used an<code>h4</code>yet
				</h4>
			</div>
		</LayoutDefault>
	)
}
