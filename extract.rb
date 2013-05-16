require 'open-uri'
require 'nokogiri'
require 'date'
require 'fileutils'
require 'reverse_markdown'
require 'yaml'

base_path = File.expand_path('../', __FILE__)
blog_path = File.join(base_path, 'blog')
output_path = File.join(base_path, '_posts')

glob_path = File.join(blog_path, '**', 'index.html')
puts glob_path
Dir[glob_path].each do |source|
  next if source =~ /\/blog\/(tags|page)/
  doc = Nokogiri::HTML(open(source))
  post_dir = File.basename(File.dirname(source))
  post_time = doc.at_css('time')[:datetime]
  post_time = Date.parse(post_time) if post_time
  post_file_title = "#{post_time.strftime('%Y-%m-%d')}-#{post_dir}.md"

  destination = File.join(output_path, post_file_title)
  puts "Copying %s -> %s" % [ source.gsub(base_path, ''), destination.gsub(base_path, '') ]

  article_body = doc.at_css('div.entry-content')
  markdown_article = ReverseMarkdown.parse(article_body)
  tags = doc.css('a.category').map { |tag| tag.content.downcase.gsub(/\s+/, '-') }.sort

  post_yaml = { 'layout' => 'post',
                'title' => doc.at_css('h1.entry-title').content,
                'published' => true,
                'tags' => tags }

  File.open(destination, 'w') do |f|
    f.write(post_yaml.to_yaml)
    f.write('---')
    f.write("\n# #{post_yaml['title']}")
    f.write(markdown_article)
  end
end
